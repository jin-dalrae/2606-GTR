/* ==========================================================================
   PROMPT + SCHEMA BUILDERS (shared by /api/generate-report and the MCP server)
   Extracted to break the import cycle between worker/index.js, worker/mcp.js,
   and worker/report.js. The cycle would be index -> mcp -> report -> index
   without this module sitting in between.
   ========================================================================== */

import { buildFactPack } from "../data/evidence.js";

const WEBSITE_CONTEXT_MAX_CHARS = 1800;

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 10) return n.toFixed(1);
  return n.toFixed(2);
}

function cleanPromptValue(value, maxChars = 600) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, maxChars);
}

function formatWebsiteContext(context) {
  if (!context || context.status === "not_provided") return "not provided";
  return `[${context.status}${context.url ? ` from ${context.url}` : ""}] ${cleanPromptValue(context.text, WEBSITE_CONTEXT_MAX_CHARS) || "n/a"}`;
}

export function buildReportPrompt(assessment, context = {}) {
  const a = assessment || {};
  const snapshot = a.snapshot || {};
  const websiteContext = context.websiteContext || {};
  const asOfDate = context.asOfDate || new Date().toISOString().slice(0, 10);
  const mode = context.mode === "preview" ? "preview" : "full";
  const activities = (a.activities || []).join(", ");
  const hotspots = (snapshot.hotspots || [])
    .map(h => `${h.name} (~${formatNumber(h.value)} tCO2e/yr)`)
    .join(", ");
  const breakdown = (snapshot.breakdown || [])
    .map(h => `${h.name}: ${formatNumber(h.value)} tCO2e/yr, Scope ${h.scope}, ${h.unc}% uncertainty`)
    .join("; ");
  const docs = [a.docs && a.docs.deck, a.docs && a.docs.accounting].filter(Boolean).join(", ");

  const facts = buildFactPack(a);
  const factPack = [
    "Curated fact pack (the ONLY facts you may cite; reference each by its source name):",
    "- Emission factor basis:",
    ...(facts.factors.length ? facts.factors.map(f => `  - ${f}`) : ["  - none (no activities selected)"]),
    `- Peer benchmark: ${facts.benchmark}`,
    `- ${facts.dimensions}`,
    `- Cost translation: ${facts.costLine}`,
    "- Frameworks / theory you may invoke:",
    ...facts.frameworks.map(f => `  - ${f}`),
    "- Real precedents you may use as examples:",
    ...facts.precedents.map(p => `  - ${p}`)
  ].join("\n");

  return [
    "You are a climate-impact analyst advising a startup or growth-company operator. Match the company scale implied by stage, team size, and business context.",
    mode === "preview"
      ? "Write the unlocked preview half of a report: useful, specific, but not the full action plan."
      : "Write the full founder-facing report with enough substance to populate a dashboard and risk radar.",
    "",
    `Current date: ${asOfDate}`,
    `Company: ${cleanPromptValue(a.name) || "Unknown"}`,
    `Website URL: ${cleanPromptValue(a.url) || "not provided"}`,
    `Stage: ${cleanPromptValue(a.stage) || "Unknown"}`,
    `Business model: ${cleanPromptValue(a.businessModel) || "Unknown"}`,
    `Team: ${Number.isFinite(Number(a.teamSize)) && Number(a.teamSize) > 0 ? Number(a.teamSize) : "unknown"} FTEs`,
    `Selected activities: ${activities || "n/a"}`,
    `Founder notes: ${cleanPromptValue(a.notes, 1000) || "n/a"}`,
    `Public website context: ${formatWebsiteContext(websiteContext)}`,
    `Selected document filenames only: ${docs || "none"}`,
    "",
    "Modeled footprint snapshot:",
    `- Annual footprint: ${snapshot.footprintTotal != null ? formatNumber(snapshot.footprintTotal) : "unknown"} tCO2e/yr`,
    `- Modeled uncertainty: ${snapshot.uncertaintyAbs != null ? formatNumber(snapshot.uncertaintyAbs) : "unknown"} tCO2e/yr`,
    `- Top hotspots: ${hotspots || "n/a"}`,
    `- Breakdown: ${breakdown || "n/a"}`,
    `- Handprint potential signal: ${snapshot.handprintPotential != null ? formatNumber(snapshot.handprintPotential) : "unknown"} tCO2e/yr`,
    "",
    factPack,
    "",
    "Evidence and realism rules:",
    "- Back specific claims with the fact pack above or with Google Search grounding. Cite the source by name (e.g. 'per the GHG Protocol Scope 3 Standard') and compare the modeled footprint against the peer benchmark where useful.",
    "- Never invent a citation, statistic, study, or URL. If neither the fact pack nor search grounding supports a claim, state the assumption instead.",
    "- Use the supplied website URL/context and Google Search grounding to look for company-specific environmental issues, recent news, sustainability pages, regulatory exposure, and similar-company incidents.",
    "- Use web search for context and risk discovery only. Do not replace the modeled footprint with unsourced web guesses, and do not invent employee counts, emissions, revenue, or geography if search does not ground them.",
    "- For similar-company examples, state why the example is analogous and label it as a peer/analog risk, not proof that it applies directly.",
    "- Use exact fact-pack source names or web-grounded source titles in citations.",
    "- Look closely at the company's actual industry (e.g. pet care, biotech, hardware, SaaS). If they produce physical goods, raw material waste, organic waste (e.g. pet waste, food ingredients), or chemical waste, explicitly highlight this as a material issue or data gap in the report. Do not assume waste is only office hardware e-waste.",
    "- In the inferredBusinessModel field, output a clean business model/industry string (e.g., 'Pet Services', 'E-commerce', 'SaaS', 'B2B Software', 'Biotech', 'Food & Agriculture') based on website text and search results.",
    "- You did not read source files. Treat selected document filenames as workflow clues only, not evidence.",
    "- Treat footprint values as modeled defaults, not measured accounting.",
    "- Tie every issue and goal to the founder notes, website context, selected activities, stage, business model, hotspots, or a fact-pack precedent.",
    "- If geography, customer segment, suppliers, or revenue thresholds are unknown, make the dependency explicit instead of inventing facts.",
    "- Do not say CSRD, SEC, California SB 253/SB 261, CBAM, EUDR, or zero-emission-zone rules apply directly unless the context or a fact-pack precedent supports it. Prefer conditional language such as 'if selling into EU enterprise customers' or 'if operating urban delivery fleets', and note the precedent's status caveat.",
    "- If the situation is too thin, say the first action is to verify the missing operational data, not to claim precision.",
    "",
    mode === "preview"
      ? "Return JSON for a preview only: headline, basis, two material issues, one likely forcing function, the first action, and a citations list naming the fact-pack or web-grounded sources you drew on. Do not include the full risk radar, goals, or methodology notes."
      : "Return JSON for the full report. Include a basis field naming the real context used and any key missing assumption. Include richer sections: executive summary, evidence gaps, methodology notes, next steps, goals, 2 to 4 dated Risk Radar items with concrete actions, and a citations list (each: the fact-pack or web-grounded source name + what it backs). Include at least one issue or risk from company-specific environmental news or a clearly analogous peer-company incident when search grounding finds one."
  ].join("\n");
}

export function buildReportSchema(mode = "full") {
  if (mode === "preview") {
    return {
      type: "object",
      properties: {
        headline: { type: "string", description: "1-2 sentence key insight grounded in the supplied company context" },
        basis: { type: "string", description: "One sentence naming facts used from notes, website context, selected activities, or hotspots; include the key assumption if context is thin" },
        inferredBusinessModel: { type: "string", description: "The inferred business model/industry category of the startup (e.g. SaaS, Pet Services, Food & Agriculture, Biotech, E-commerce) based on the website context and notes." },
        isComputeIntensiveAI: { type: "boolean", description: "True if the company is an enterprise AI infrastructure, foundational model, or massive data labeling company (requires massive compute scale)." },
        issues: {
          type: "array",
          description: "Exactly two material issues visible in the preview",
          items: {
            type: "object",
            properties: { title: { type: "string" }, detail: { type: "string" } },
            required: ["title", "detail"]
          }
        },
        regulation: { type: "string", description: "One sentence: a real regulation, standard, or customer requirement and the assumption that makes it relevant" },
        firstAction: { type: "string", description: "One sentence: the recommended first move" },
        citations: {
          type: "array",
          description: "1 to 3 sources you relied on. Use exact fact-pack source names or web-grounded source titles surfaced by Google Search.",
          items: { type: "string" }
        }
      },
      required: ["headline", "basis", "inferredBusinessModel", "issues", "regulation", "firstAction"]
    };
  }

  return {
    type: "object",
    properties: {
      headline: { type: "string", description: "1-2 sentence key insight grounded in the supplied company context" },
      basis: { type: "string", description: "One sentence naming facts used from notes, website context, selected activities, or hotspots; include the key assumption if context is thin" },
      inferredBusinessModel: { type: "string", description: "The inferred business model/industry category of the startup (e.g. SaaS, Pet Services, Food & Agriculture, Biotech, E-commerce) based on the website context and notes." },
      executiveSummary: { type: "string", description: "3-5 sentences with the practical interpretation of the modeled footprint, handprint signal, and strongest operational implication" },
      issues: {
        type: "array",
        description: "3 to 5 material issues, each tied to supplied company context",
        items: {
          type: "object",
          properties: { title: { type: "string" }, detail: { type: "string" } },
          required: ["title", "detail"]
        }
      },
      regulation: { type: "string", description: "One sentence: a real regulation, standard, or customer requirement and the assumption that makes it relevant" },
      unexpected: { type: "string", description: "One sentence: an unexpected second-order effect + rough timing" },
      firstAction: { type: "string", description: "One sentence: the recommended first move" },
      goalPriorities: { type: "array", items: { type: "string" }, description: "Up to 3 short goal titles" },
      evidenceGaps: { type: "array", items: { type: "string" }, description: "3 to 5 missing facts or evidence items needed to make the assessment investor-grade" },
      methodologyNotes: { type: "array", items: { type: "string" }, description: "3 to 5 notes explaining how the modeled estimate should be interpreted and improved" },
      nextSteps: { type: "array", items: { type: "string" }, description: "3 to 5 concrete next actions in priority order" },
      risks: {
        type: "array",
        description: "2 to 4 dated regulatory or second-order risks for the Risk Radar",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Short risk name" },
            regulation: { type: "string", description: "The law, standard, or trend behind it" },
            timing: { type: "string", description: "When it bites, e.g. 'Dec 2025' or '2027'" },
            severity: { type: "string", enum: ["high", "medium", "low"] },
            action: { type: "string", description: "One short sentence: what to do about it" }
          },
          required: ["title", "regulation", "timing", "severity", "action"]
        }
      },
      citations: {
        type: "array",
        description: "2 to 5 sources you relied on. Each: 'Source name or web source title - what it backs'. Use exact fact-pack source names or web-grounded source titles; do not invent sources.",
        items: { type: "string" }
      }
    },
    required: ["headline", "basis", "inferredBusinessModel", "executiveSummary", "issues", "regulation", "firstAction", "goalPriorities", "evidenceGaps", "methodologyNotes", "nextSteps", "risks", "citations"]
  };
}

export function extractGrounding(data) {
  const candidate = data && data.candidates && data.candidates[0];
  const metadata = candidate && candidate.groundingMetadata;
  if (!metadata) return { queries: [], sources: [] };

  const queries = Array.from(new Set((metadata.webSearchQueries || [])
    .map(q => String(q || "").trim())
    .filter(Boolean)));

  const seen = new Set();
  const sources = (metadata.groundingChunks || [])
    .map(chunk => chunk && chunk.web)
    .filter(web => web && web.uri)
    .map(web => ({
      title: String(web.title || web.uri).trim(),
      uri: String(web.uri || "").trim()
    }))
    .filter(source => {
      if (!source.uri || seen.has(source.uri)) return false;
      seen.add(source.uri);
      return true;
    })
    .slice(0, 8);

  return { queries, sources };
}
