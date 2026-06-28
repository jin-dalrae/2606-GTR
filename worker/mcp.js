/* ==========================================================================
   CLIMATE IMPACT DASHBOARD — MCP SERVER
   Remote MCP server (Streamable HTTP at /mcp) that exposes the assessment
   tools to AI clients (Claude Desktop, Cursor, etc.). Uses the raw MCP SDK
   with the Web Standard Streamable HTTP transport — works on any runtime
   that supports fetch + ReadableStream (Node 18+, Cloudflare Workers, Deno,
   Bun). Stateless: no Durable Object required, no per-session state.

   Why not McpAgent (agents/mcp)?
   The Agents SDK ships `cloudflare:` protocol imports that work in Workers
   but break in Node-based test runners. The MCP server is fundamentally
   stateless (each tool call is self-contained), so a Durable Object per
   session is overkill. The raw SDK gives us the same Streamable HTTP
   surface without the runtime coupling.

   Philosophy: founders using this from Claude Desktop never have to visit
   the standalone site. Data stays in their AI client. They get a report.
   Dashboard push is opt-in via a separate tool.
   ========================================================================== */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { computeSnapshot, listActivities, ACTIVITIES_DB, DEFAULT_MODEL_TEAM_SIZE } from "./snapshot.js";
import { FRAMEWORKS, BUSINESS_MODEL_OPTIONS, FUNDING_STAGES } from "../data/evidence.js";
import { generateReportPayload } from "./report.js";

const SERVER_NAME = "climate-impact-mcp";
const SERVER_VERSION = "1.0.0";

function registerTools(server, env) {
  server.registerTool(
    "list_business_models",
    { description: "List the recognized business-model archetypes. The founder picks one (or 'other'). This is metadata \u2014 it doesn't feed the math." },
    async () => ({
      content: [{ type: "text", text: JSON.stringify({ options: BUSINESS_MODEL_OPTIONS }, null, 2) }]
    })
  );

  server.registerTool(
    "list_funding_stages",
    { description: "List the recognized funding stages for the assessment input." },
    async () => ({
      content: [{ type: "text", text: JSON.stringify({ stages: FUNDING_STAGES }, null, 2) }]
    })
  );

  server.registerTool(
    "list_activities",
    { description: "List every activity the founder can include in their assessment. Each activity contributes a default emissions line to the footprint. The AI should ask which ones apply and pass the selected IDs to compute_snapshot." },
    async () => ({
      content: [{
        type: "text",
        text: JSON.stringify({
          defaultTeamSize: DEFAULT_MODEL_TEAM_SIZE,
          note: "scope2-grid and scope1-direct are auto-included; you don't need to send them.",
          activities: listActivities()
        }, null, 2)
      }]
    })
  );

  server.registerTool(
    "list_glossary_terms",
    { description: "Return the full glossary of climate-impact terms. Use this to answer founder questions like 'what is a handprint?' without making up definitions." },
    async () => ({
      content: [{ type: "text", text: JSON.stringify(GLOSSARY_DB, null, 2) }]
    })
  );

  server.registerTool(
    "list_frameworks",
    { description: "Return the standards/frameworks the assessment rests on (GHG Protocol, SBTi, SCI, etc.). Use when the founder asks 'what methodology?'." },
    async () => ({
      content: [{ type: "text", text: JSON.stringify({ frameworks: FRAMEWORKS }, null, 2) }]
    })
  );

  server.registerTool(
    "compute_snapshot",
    {
      description: "Compute a modeled footprint + handprint snapshot from raw inputs. The math uses the same per-FTE emission factors the standalone site uses, so the numbers are consistent end-to-end. Pass only the activities that apply \u2014 scope2-grid and scope1-direct are auto-included. Returns a JSON snapshot the AI can show the founder before they decide to generate the full report.",
      inputSchema: {
        companyName: z.string().describe("Company name as the founder gave it. e.g. 'Climatico'"),
        url: z.string().optional().describe("Public website URL. Optional but recommended \u2014 used by the AI briefing to ground the report."),
        stage: z.enum(FUNDING_STAGES).describe("Funding stage. One of list_funding_stages."),
        businessModel: z.string().describe("Free-text business model description. e.g. 'B2B SaaS for utility-scale solar O&M'. The free text is kept for the report; no structured enum is enforced."),
        teamSize: z.number().int().min(0).describe("Full-time-equivalent headcount, including founders and contractors. 0 is allowed \u2014 falls back to the 10-FTE default model."),
        activities: z.array(z.string()).describe("Activity IDs that apply. Get the list from list_activities. e.g. ['compute', 'travel', 'avoided-transport']."),
        notes: z.string().optional().describe("Optional founder notes for the report briefing."),
        isFoundationModel: z.boolean().optional().describe("If true, applies the 1000x compute multiplier + 25,000 tCO2e/yr RLHF workforce footprint. Same flag as the standalone site.")
      }
    },
    async (args) => {
      const activities = Array.isArray(args.activities) ? args.activities : [];
      const unknown = activities.filter((k) => !ACTIVITIES_DB[k]);
      if (unknown.length) {
        return {
          isError: true,
          content: [{ type: "text", text: `Unknown activity IDs: ${unknown.join(", ")}. Call list_activities for valid IDs.` }]
        };
      }
      const snapshot = computeSnapshot(activities, args.teamSize);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            company: { name: args.companyName, stage: args.stage, businessModel: args.businessModel, teamSize: args.teamSize, isFoundationModel: !!args.isFoundationModel },
            footprintTotal: snapshot.footprintTotal,
            handprintPotential: snapshot.handprintPotential,
            uncertaintyAbs: snapshot.uncertaintyAbs,
            scaleFactor: snapshot.scaleFactor,
            hotspots: snapshot.hotspots,
            breakdown: snapshot.breakdown,
            scalingBasis: snapshot.scalingBasis,
            nextStep: "If the founder is happy with the snapshot, call generate_report(assessment) for the AI briefing. Otherwise, ask for adjusted inputs and re-run compute_snapshot."
          }, null, 2)
        }]
      };
    }
  );

  server.registerTool(
    "generate_report",
    {
      description: "Generate the AI-graded climate briefing (the report). Calls the Worker /api/generate-report internally, which uses Gemini with Google Search grounding and the curated evidence library. Returns the full report JSON (headline, hotspots, impact profile, peer benchmark, cost exposure, risk radar, AI briefing with cited sources). Takes ~10-30s. Rate-limited for anonymous callers; signed-in users get the full report.",
      inputSchema: {
        assessment: z.any().describe("The full assessment object as returned by compute_snapshot (or as the founder typed it in). Must include a .snapshot with footprintTotal, breakdown, hotspots, handprintPotential."),
        mode: z.enum(["preview", "full"]).optional().describe("'preview' for short anonymous reports (default for no-auth callers), 'full' for the complete long-form report.")
      }
    },
    async (args) => {
      try {
        const payload = await generateReportPayload(env, args.assessment, args.mode || "preview");
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              ok: true,
              mode: payload.mode,
              report: payload.report,
              snapshot: payload.snapshot,
              note: "This is the full AI-graded report. Show the founder the headline, hotspots, peer benchmark, and the AI briefing. Sharing and dashboard save are OPT-IN \u2014 do not push this anywhere without the founder's explicit request."
            }, null, 2)
          }]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: "text", text: `generate_report failed: ${err && err.message ? err.message : String(err)}` }]
        };
      }
    }
  );

  server.registerTool(
    "create_dashboard_save_link",
    {
      description: "Generate a one-time link the founder can click to save this assessment to the dashboard. The link encodes the assessment as a short-lived payload. Sharing is opt-in \u2014 only call this when the founder explicitly asks to save.",
      inputSchema: {
        assessment: z.any().describe("The assessment to save. Same shape as compute_snapshot output."),
        ttlSeconds: z.number().int().min(60).max(3600).optional().describe("How long the save link is valid. Default 600 (10 minutes).")
      }
    },
    async (args) => {
      const ttl = args.ttlSeconds || 600;
      const origin = (env && env.PUBLIC_ORIGIN) || "https://2606gtr.dalrae-jin-work.workers.dev";
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            link: `${origin}/#mcp-save`,
            instructions: "The dashboard's MCP-save handler will read the assessment from the AI client's response. For now, hand the assessment JSON to the founder and let them paste it into the dashboard's onboarding flow at " + origin,
            ttlSeconds: ttl,
            assessment: args.assessment,
            note: "MVP: the dashboard doesn't auto-receive MCP assessments yet. The link points to the dashboard; the assessment JSON is included for the founder to copy."
          }, null, 2)
        }]
      };
    }
  );
}

export async function handleMcpRequest(request, env) {
  if (request.method === "GET" && new URL(request.url).pathname === "/mcp/health") {
    return new Response(JSON.stringify({ ok: true, server: SERVER_NAME, version: SERVER_VERSION }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  registerTools(server, env);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  await server.connect(transport);
  const response = await transport.handleRequest(request, {
    onSessionInitialized: () => {},
    onSessionClosed: () => {}
  });
  return response;
}
