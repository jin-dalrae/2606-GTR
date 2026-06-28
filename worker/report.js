/* ==========================================================================
   REPORT GENERATION HELPER
   Extracted core of /api/generate-report (Worker) so the MCP server can call
   the same Gemini pipeline without going through HTTP/cookies/auth. The
   shape of the result is identical to the /api/generate-report response.
   ========================================================================== */

import {
  buildReportPrompt,
  buildReportSchema,
  extractGrounding
} from "./prompt.js";

const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";
const GEMINI_PREVIEW_MAX_OUTPUT_TOKENS = 700;
const GEMINI_FULL_MAX_OUTPUT_TOKENS = 2200;

// We need a minimal subset of helpers from the worker. Re-import the bits the
// report pipeline needs (buildReportPrompt / buildReportSchema / extractGrounding)
// at the top of this file. fetchWebsiteContext is also reused — re-define a
// stripped version here to avoid pulling in the full worker module.
const WEBSITE_FETCH_TIMEOUT_MS = 3500;
const WEBSITE_CONTEXT_MAX_BYTES = 64 * 1024;
const WEBSITE_CONTEXT_MAX_CHARS = 1800;

async function fetchWebsiteContext(urlString) {
  if (!urlString) return { url: "", bytes: 0, text: "", blocked: false, error: null };
  let normalized;
  try {
    const u = new URL(urlString);
    if (!/^https?:$/.test(u.protocol)) return { url: urlString, bytes: 0, text: "", blocked: false, error: "non-http scheme" };
    normalized = u.toString();
  } catch {
    return { url: urlString, bytes: 0, text: "", blocked: false, error: "invalid url" };
  }
  if (isBlockedHost(normalized)) {
    return { url: normalized, bytes: 0, text: "", blocked: true, error: "private or local host blocked" };
  }
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), WEBSITE_FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(normalized, {
      method: "GET",
      redirect: "follow",
      signal: ctl.signal,
      headers: { "User-Agent": "ClimateImpactBot/1.0 (+mcp)" }
    });
    if (!resp.ok) return { url: normalized, bytes: 0, text: "", blocked: false, error: `http ${resp.status}` };
    const reader = resp.body && resp.body.getReader ? resp.body.getReader() : null;
    if (!reader) return { url: normalized, bytes: 0, text: "", blocked: false, error: "no body" };
    let received = 0;
    const chunks = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      received += value.byteLength;
      chunks.push(value);
      if (received >= WEBSITE_CONTEXT_MAX_BYTES) break;
    }
    const buf = new Uint8Array(received);
    let off = 0;
    for (const c of chunks) { buf.set(c, off); off += c.byteLength; }
    const text = new TextDecoder("utf-8", { fatal: false }).decode(buf).slice(0, WEBSITE_CONTEXT_MAX_CHARS);
    return { url: normalized, bytes: received, text, blocked: false, error: null };
  } catch (err) {
    return { url: normalized, bytes: 0, text: "", blocked: false, error: String(err && err.message || err) };
  } finally {
    clearTimeout(t);
  }
}

function isBlockedHost(urlString) {
  try {
    const u = new URL(urlString);
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host === "0.0.0.0" || host === "::1" || host === "[::1]") return true;
    if (/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(host)) return true;
    if (host.endsWith(".local") || host.endsWith(".internal")) return true;
    if (/^(metadata|instance-data)\.google\.internal$/.test(host)) return true;
    return false;
  } catch { return true; }
}

async function getSecret(env, name) {
  if (env && typeof env[name] === "function") {
    try { return await env[name](); } catch { return null; }
  }
  if (env && env[name] && typeof env[name].get === "function") {
    try { return await env[name].get(); } catch { return null; }
  }
  return null;
}

// Run the Gemini pipeline for an assessment. Throws on hard failure.
// No auth/cookies/quota — the MCP caller is whatever the AI client is.
export async function generateReportPayload(env, assessment, mode = "preview") {
  const a = (assessment && typeof assessment === "object") ? JSON.parse(JSON.stringify(assessment)) : {};
  if (!a.snapshot) throw new Error("assessment.snapshot is required");
  const useMode = mode === "full" ? "full" : "preview";

  const apiKey = await getSecret(env, "AI_API_KEY");
  if (!apiKey) {
    const err = new Error("AI is not configured yet. Add the Gemini key to the secret store.");
    err.status = 503;
    throw err;
  }

  const websiteContext = await fetchWebsiteContext(a.url);
  const prompt = buildReportPrompt(a, {
    websiteContext,
    asOfDate: new Date().toISOString().slice(0, 10),
    mode: useMode
  });
  const schema = buildReportSchema(useMode);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          maxOutputTokens: useMode === "preview" ? GEMINI_PREVIEW_MAX_OUTPUT_TOKENS : GEMINI_FULL_MAX_OUTPUT_TOKENS,
          temperature: 0.5,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      })
    });
  } catch (err) {
    const e = new Error("Could not reach the AI service.");
    e.status = 502;
    throw e;
  }

  if (!resp.ok) {
    const detail = await resp.text();
    const e = new Error(`AI request failed (${resp.status}): ${detail.slice(0, 200)}`);
    e.status = 502;
    throw e;
  }

  const data = await resp.json();
  const text = data && data.candidates && data.candidates[0] &&
    data.candidates[0].content && data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
  if (!text) {
    const e = new Error("AI returned no content.");
    e.status = 502;
    throw e;
  }

  let report;
  try { report = JSON.parse(text); } catch {
    const e = new Error("AI returned malformed output.");
    e.status = 502;
    throw e;
  }

  // Foundation-model auto-scaling (same logic as the /api/generate-report handler).
  if (report.isComputeIntensiveAI && a.snapshot && !a.isEnterpriseAI) {
    a.isEnterpriseAI = true;
    a.snapshot = { ...a.snapshot };
    a.snapshot.scaleFactor = Math.max(a.snapshot.scaleFactor || 1, 120);
    if (Array.isArray(a.snapshot.breakdown)) {
      a.snapshot.breakdown = a.snapshot.breakdown.map((item) => {
        if (item.id === "compute") {
          const baseValue = 8.5;
          return { ...item, value: baseValue * a.snapshot.scaleFactor * 1000, baseValue };
        }
        return item;
      });
      if (!a.snapshot.breakdown.some((item) => item.id === "contractors")) {
        a.snapshot.breakdown.push({
          id: "contractors",
          name: "Distributed Contractor Network",
          value: 25000,
          baseValue: 25000,
          unc: 40,
          scope: 3,
          scopeLabel: "Scope 3, Category 1 (Purchased Goods and Services) \u00b7 Contingent Workforce"
        });
      }
      a.snapshot.footprintTotal = a.snapshot.breakdown.reduce((sum, item) => sum + item.value, 0);
      let uncSumSq = 0;
      a.snapshot.breakdown.forEach((item) => {
        const uncAbs = item.value * (item.unc / 100);
        uncSumSq += Math.pow(uncAbs, 2);
      });
      a.snapshot.uncertaintyAbs = Math.sqrt(uncSumSq);
      const hotspots = [...a.snapshot.breakdown].sort((x, y) => y.value - x.value).slice(0, 3);
      const maxVal = hotspots.length ? hotspots[0].value : 1;
      a.snapshot.hotspots = hotspots.map((h) => ({ ...h, pct: Math.round((h.value / maxVal) * 100) }));
    }
    a.snapshot.scalingBasis = "Auto-detected Enterprise Foundation Model: Compute multiplied by 1000x + distributed workforce footprint added.";
  }

  const grounding = extractGrounding(data);
  if (grounding.queries.length || grounding.sources.length) {
    report.webSearchQueries = grounding.queries;
    report.webSources = grounding.sources;
  }

  return { report, snapshot: a.snapshot, mode: useMode, quota: null };
}
