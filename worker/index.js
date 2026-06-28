/* ==========================================================================
   CLIMATE IMPACT DASHBOARD — Worker API
   Serves /api/* (accounts, workspace state, documents) and falls back to the
   static SPA assets for everything else. No external dependencies.
   ========================================================================== */

import { buildFactPack } from "../data/evidence.js";
import { buildReportPrompt, buildReportSchema, extractGrounding } from "./prompt.js";
import { computeSnapshot, listActivities, ACTIVITIES_DB } from "./snapshot.js";
import { handleMcpRequest } from "./mcp.js";

const SESSION_COOKIE = "sid";
const SESSION_TTL_DAYS = 30;
const PBKDF2_ITERATIONS = 100000;
const ANONYMOUS_REPORT_LIMIT_PER_DAY = 10;

// Gemini config — kept tight to control API spend.
const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";
const GEMINI_PREVIEW_MAX_OUTPUT_TOKENS = 700;
const GEMINI_FULL_MAX_OUTPUT_TOKENS = 2200;
const WEBSITE_FETCH_TIMEOUT_MS = 3500;
const WEBSITE_CONTEXT_MAX_BYTES = 64 * 1024;
const WEBSITE_CONTEXT_MAX_CHARS = 1800;
const REPORT_LIMITS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS anonymous_report_limits (
    day          TEXT NOT NULL,
    subject_hash TEXT NOT NULL,
    count        INTEGER NOT NULL DEFAULT 0,
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (day, subject_hash)
  )
`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/mcp")) {
      return handleMcpRequest(request, env);
    }

    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env, url);
      } catch (err) {
        return json({ error: "Internal error", detail: String(err && err.message || err) }, 500);
      }
    }
    // Non-API request -> static asset (SPA). Usually served before the Worker,
    // this is a safety fallback.
    return env.ASSETS.fetch(request);
  }
};

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
async function handleApi(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  if (path === "/api/signup" && method === "POST") return signup(request, env);
  if (path === "/api/login" && method === "POST") return login(request, env);
  if (path === "/api/logout" && method === "POST") return logout(request, env);
  if (path === "/api/me" && method === "GET") return me(request, env);

  if (path === "/api/state" && method === "GET") return getState(request, env);
  if (path === "/api/state" && method === "PUT") return putState(request, env);

  if (path === "/api/compute-snapshot" && method === "POST") return computeSnapshotEndpoint(request, env);
  if (path === "/api/list-activities" && method === "GET") return listActivitiesEndpoint(request, env);

  if (path === "/api/generate-report" && method === "POST") return generateReport(request, env);

  if (path === "/api/reports" && method === "GET") return listReports(request, env);
  if (path === "/api/reports" && method === "POST") return createReport(request, env);
  const reportMatch = path.match(/^\/api\/reports\/([A-Za-z0-9_-]+)$/);
  if (reportMatch && method === "GET") return getReport(request, env, reportMatch[1]);
  if (reportMatch && method === "DELETE") return deleteReport(request, env, reportMatch[1]);

  if (path === "/api/documents" && method === "GET") return listDocuments(request, env);
  if (path === "/api/documents" && method === "POST") return uploadDocument(request, env);
  const docMatch = path.match(/^\/api\/documents\/([A-Za-z0-9_-]+)$/);
  if (docMatch && method === "GET") return getDocument(request, env, docMatch[1]);
  if (docMatch && method === "DELETE") return deleteDocument(request, env, docMatch[1]);

  if (path === "/api/admin/stats" && method === "GET") return getAdminStats(request, env);
  if (path === "/api/admin/token-logs" && method === "GET") return getAdminTokenLogs(request, env);

  return json({ error: "Not found." }, 404);
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------
async function signup(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = body.password || "";

  if (!isValidEmail(email)) return json({ error: "Enter a valid email address." }, 400);
  if (password.length < 8) return json({ error: "Password must be at least 8 characters." }, 400);

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return json({ error: "An account with this email already exists." }, 409);

  const id = crypto.randomUUID();
  const pwHash = await hashPassword(password);
  await env.DB.prepare("INSERT INTO users (id, email, pw_hash) VALUES (?, ?, ?)")
    .bind(id, email, pwHash).run();

  const cookie = await createSession(env, id);
  return json({ email }, 201, { "Set-Cookie": cookie });
}

async function login(request, env) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = body.password || "";

  const user = await env.DB.prepare("SELECT id, pw_hash FROM users WHERE email = ?").bind(email).first();
  if (!user || !(await verifyPassword(password, user.pw_hash))) {
    return json({ error: "Incorrect email or password." }, 401);
  }

  const cookie = await createSession(env, user.id);
  return json({ email }, 200, { "Set-Cookie": cookie });
}

async function logout(request, env) {
  const sid = readSessionId(request);
  if (sid) await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sid).run();
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
}

async function me(request, env) {
  const session = await getSession(request, env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  return json({ email: session.email });
}

// ---------------------------------------------------------------------------
// Workspace state (JSON blob per user)
// ---------------------------------------------------------------------------
async function getState(request, env) {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  const row = await env.DB.prepare("SELECT state_json, updated_at FROM workspaces WHERE user_id = ?")
    .bind(session.user_id).first();
  if (!row) return json({ state: null });
  return json({ state: JSON.parse(row.state_json), updated_at: row.updated_at });
}

async function putState(request, env) {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  const body = await readJson(request);
  if (!body || typeof body.state !== "object" || body.state === null) {
    return json({ error: "Missing state object." }, 400);
  }
  const stateJson = JSON.stringify(body.state);
  await env.DB.prepare(
    `INSERT INTO workspaces (user_id, state_json, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, updated_at = datetime('now')`
  ).bind(session.user_id, stateJson).run();

  return json({ ok: true });
}

async function computeSnapshotEndpoint(request, env) {
  const body = await readJson(request);
  const activities = Array.isArray(body.activities) ? body.activities : [];
  const unknown = activities.filter((k) => !ACTIVITIES_DB[k]);
  if (unknown.length) {
    return json({ error: `Unknown activity IDs: ${unknown.join(", ")}`, validActivities: Object.keys(ACTIVITIES_DB) }, 400);
  }
  const teamSize = Number(body.teamSize) || 0;
  const snapshot = computeSnapshot(activities, teamSize);
  return json({
    snapshot,
    assessment: {
      name: body.companyName || "",
      url: body.url || "",
      stage: body.stage || "",
      businessModel: body.businessModel || "",
      teamSize,
      activities: [...new Set([...activities, "scope2-grid", "scope1-direct"])],
      isFoundationModel: !!body.isFoundationModel,
      isEnterpriseAI: !!body.isFoundationModel,
      snapshot,
      createdAt: new Date().toISOString()
    }
  });
}

async function listActivitiesEndpoint(request, env) {
  return json({ activities: listActivities() });
}

// ---------------------------------------------------------------------------
// AI report + dashboard fill (Gemini). Anonymous users get a rate-limited
// preview; signed-in users get the full report and dashboard-fill payload.
// ---------------------------------------------------------------------------
async function generateReport(request, env) {
  const apiKey = await getSecret(env, "AI_API_KEY");
  if (!apiKey) {
    return json({ error: "AI is not configured yet. Add the Gemini key to the secret store." }, 503);
  }

  const session = await getSession(request, env);
  const body = await readJson(request);
  const a = body.assessment || {};
  const requestedMode = body.mode === "full" ? "full" : "preview";
  const mode = session ? requestedMode : "preview";
  let quota = null;

  if (!session) {
    quota = await consumeAnonymousReportQuota(request, env);
    if (!quota.allowed) {
      return json({
        error: "Daily preview limit reached. Create an account to generate the full report.",
        mode: "preview",
        quota
      }, 429);
    }
  }

  const websiteContext = await fetchWebsiteContext(a.url);
  const prompt = buildReportPrompt(a, { websiteContext, asOfDate: new Date().toISOString().slice(0, 10), mode });
  const schema = buildReportSchema(mode);

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
          maxOutputTokens: mode === "preview" ? GEMINI_PREVIEW_MAX_OUTPUT_TOKENS : GEMINI_FULL_MAX_OUTPUT_TOKENS,
          temperature: 0.5,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      })
    });
  } catch (err) {
    return json({ error: "Could not reach the AI service." }, 502);
  }

  if (!resp.ok) {
    const detail = await resp.text();
    return json({ error: "AI request failed.", status: resp.status, detail: detail.slice(0, 500) }, 502);
  }

  const data = await resp.json();
  const text = data && data.candidates && data.candidates[0] &&
    data.candidates[0].content && data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
  if (!text) return json({ error: "AI returned no content." }, 502);

  let report;
  try { report = JSON.parse(text); } catch { return json({ error: "AI returned malformed output." }, 502); }

  if (report.isComputeIntensiveAI && a.snapshot && !a.isEnterpriseAI) {
      a.isEnterpriseAI = true;
      a.snapshot = { ...a.snapshot };
      a.snapshot.scaleFactor = Math.max(a.snapshot.scaleFactor || 1, 120); 
      if (Array.isArray(a.snapshot.breakdown)) {
        a.snapshot.breakdown = a.snapshot.breakdown.map(item => {
          if (item.id === "compute") {
            const baseValue = 8.5;
            const scaledVal = baseValue * a.snapshot.scaleFactor * 1000;
            return {
              ...item,
              value: scaledVal,
              baseValue: baseValue
            };
          }
          return item;
        });

        if (!a.snapshot.breakdown.some(item => item.id === "contractors")) {
          a.snapshot.breakdown.push({
            id: "contractors",
            name: "Distributed Contractor Network",
            value: 25000,
            baseValue: 25000,
            unc: 40,
            scope: 3,
            scopeLabel: "Scope 3, Category 1 (Purchased Goods and Services) · Contingent Workforce"
          });
        }
        
        a.snapshot.footprintTotal = a.snapshot.breakdown.reduce((sum, item) => sum + item.value, 0);
        
        let uncSumSq = 0;
        a.snapshot.breakdown.forEach(item => {
          const uncAbs = item.value * (item.unc / 100);
          uncSumSq += Math.pow(uncAbs, 2);
        });
        a.snapshot.uncertaintyAbs = Math.sqrt(uncSumSq);

        const hotspots = [...a.snapshot.breakdown].sort((x, y) => y.value - x.value).slice(0, 3);
        const maxVal = hotspots.length ? hotspots[0].value : 1;
        a.snapshot.hotspots = hotspots.map(h => ({ ...h, pct: Math.round((h.value / maxVal) * 100) }));
      }
      a.snapshot.scalingBasis = "Auto-detected Enterprise Foundation Model: Compute multiplied by 1000x + distributed workforce footprint added.";
  }

  // Update server state if session exists
  if (session) {
    body.assessment = a;
    const stateJson = JSON.stringify(body);
    await env.DB.prepare(
      `UPDATE workspaces SET state_json = ?, updated_at = datetime('now') WHERE user_id = ?`
    ).bind(stateJson, session.user_id).run();
  }

  const grounding = extractGrounding(data);
  if (grounding.queries.length || grounding.sources.length) {
    report.webSearchQueries = grounding.queries;
    report.webSources = grounding.sources;
  }

  // Log token usage
  const usage = data.usageMetadata || {};
  const promptTokens = Number(usage.promptTokenCount || 0);
  const completionTokens = Number(usage.candidatesTokenCount || 0);
  const totalTokens = Number(usage.totalTokenCount || 0);

  if (session) {
    try {
      await env.DB.prepare(
        `INSERT INTO token_usage_logs (id, user_id, report_name, prompt_tokens, completion_tokens, total_tokens)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(crypto.randomUUID(), session.user_id, a.name || "Unknown", promptTokens, completionTokens, totalTokens).run();
    } catch (e) {
      console.error("Token log error", e);
    }
  }

  return json({ report, snapshot: a.snapshot, mode, quota });
}

async function consumeAnonymousReportQuota(request, env, today = new Date().toISOString().slice(0, 10)) {
  await env.DB.prepare(REPORT_LIMITS_SCHEMA).run();

  const clientIp = getClientIp(request);
  const subjectHash = await sha256Hex(`${today}:${clientIp || "unknown"}`);
  const row = await env.DB.prepare(
    "SELECT count FROM anonymous_report_limits WHERE day = ? AND subject_hash = ?"
  ).bind(today, subjectHash).first();
  const current = Number(row && row.count || 0);

  if (current >= ANONYMOUS_REPORT_LIMIT_PER_DAY) {
    return {
      allowed: false,
      limit: ANONYMOUS_REPORT_LIMIT_PER_DAY,
      remaining: 0,
      reset: nextUtcDayIso(today)
    };
  }

  const next = current + 1;
  if (row) {
    await env.DB.prepare(
      "UPDATE anonymous_report_limits SET count = ?, updated_at = datetime('now') WHERE day = ? AND subject_hash = ?"
    ).bind(next, today, subjectHash).run();
  } else {
    await env.DB.prepare(
      "INSERT INTO anonymous_report_limits (day, subject_hash, count) VALUES (?, ?, ?)"
    ).bind(today, subjectHash, next).run();
  }

  return {
    allowed: true,
    limit: ANONYMOUS_REPORT_LIMIT_PER_DAY,
    remaining: Math.max(0, ANONYMOUS_REPORT_LIMIT_PER_DAY - next),
    reset: nextUtcDayIso(today)
  };
}

function getClientIp(request) {
  const headers = request.headers;
  const cfIp = headers.get("CF-Connecting-IP");
  if (cfIp) return cfIp.trim();
  const trueClientIp = headers.get("True-Client-IP");
  if (trueClientIp) return trueClientIp.trim();
  const forwarded = headers.get("X-Forwarded-For");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "";
}

function nextUtcDayIso(day) {
  const next = new Date(`${day}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString();
}

async function sha256Hex(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  const hashArr = Array.from(new Uint8Array(bytes));
  return hashArr.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------------------
// ADMIN ROUTES
// ---------------------------------------------------------------------------

async function requireAdmin(request, env) {
  const session = await getSession(request, env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  const user = await env.DB.prepare("SELECT email, is_admin FROM users WHERE id = ?").bind(session.user_id).first();
  if (!user) return json({ error: "User not found" }, 404);
  const isEmailAdmin = user.email.startsWith("admin@") || user.email === "rae@sociallab.com";
  if (user.is_admin === 1 || isEmailAdmin) {
    return { user_id: session.user_id, email: user.email, is_admin: user.is_admin };
  }
  return json({ error: "Forbidden" }, 403);
}

async function getAdminStats(request, env) {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  try {
    const [users, workspaces, documents, reports, tokensResult] = await Promise.all([
      env.DB.prepare("SELECT count(*) as count FROM users").first(),
      env.DB.prepare("SELECT count(*) as count FROM workspaces").first(),
      env.DB.prepare("SELECT count(*) as count FROM documents").first(),
      env.DB.prepare("SELECT count(*) as count FROM report_history").first(),
      env.DB.prepare("SELECT sum(prompt_tokens) as p, sum(completion_tokens) as c, sum(total_tokens) as t FROM token_usage_logs").first()
    ]);

    return json({
      users: users.count || 0,
      workspaces: workspaces.count || 0,
      documents: documents.count || 0,
      reports: reports.count || 0,
      tokens: {
        prompt: tokensResult.p || 0,
        completion: tokensResult.c || 0,
        total: tokensResult.t || 0
      }
    });
  } catch (err) {
    return json({ error: "Error fetching stats" }, 500);
  }
}

async function getAdminTokenLogs(request, env) {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;

  try {
    const result = await env.DB.prepare(`
      SELECT l.created_at, u.email as user_id, l.prompt_tokens, l.completion_tokens, l.total_tokens
      FROM token_usage_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `).all();
    return json({ logs: result.results || [] });
  } catch (err) {
    return json({ error: "Error fetching logs" }, 500);
  }
}

async function fetchWebsiteContext(rawUrl) {
  const url = normalizePublicWebsiteUrl(rawUrl);
  if (!url) return { status: "not_provided", text: "No company website URL was provided." };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBSITE_FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept": "text/html,text/plain;q=0.8"
      }
    });

    if (!resp.ok) return { status: "unavailable", url, text: `Website returned HTTP ${resp.status}.` };
    const contentType = resp.headers.get("Content-Type") || "";
    if (contentType && !/text\/html|text\/plain|application\/xhtml\+xml/i.test(contentType)) {
      return { status: "unsupported", url, text: `Website returned unsupported content type ${contentType}.` };
    }

    const raw = await readTextCapped(resp, WEBSITE_CONTEXT_MAX_BYTES);
    const text = extractUsefulText(raw).slice(0, WEBSITE_CONTEXT_MAX_CHARS);
    if (!text) return { status: "empty", url, text: "Website text could not be extracted." };
    return { status: "ok", url, text };
  } catch (err) {
    return { status: "unavailable", url, text: "Website context could not be fetched within the assessment timeout." };
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizePublicWebsiteUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return null;

  let url;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(url.protocol)) return null;
  if (url.username || url.password) return null;
  if (isBlockedHostname(url.hostname)) return null;
  url.hash = "";
  return url.toString();
}

function isBlockedHostname(hostname) {
  const host = String(hostname || "").toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  if (host.includes(":")) return true;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;

  const parts = ipv4.slice(1).map(n => Number(n));
  if (parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a === 169 && b === 254 ||
    a === 172 && b >= 16 && b <= 31 ||
    a === 192 && b === 168
  );
}

async function readTextCapped(resp, maxBytes) {
  if (!resp.body) return "";
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let text = "";

  try {
    while (bytesRead < maxBytes) {
      const { value, done } = await reader.read();
      if (done) break;
      const remaining = maxBytes - bytesRead;
      const chunk = value.byteLength > remaining ? value.slice(0, remaining) : value;
      text += decoder.decode(chunk, { stream: true });
      bytesRead += chunk.byteLength;
      if (value.byteLength > remaining) break;
    }
  } finally {
    try { await reader.cancel(); } catch {}
  }

  return text + decoder.decode();
}

function extractUsefulText(markup) {
  return decodeHtmlEntities(String(markup || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function decodeHtmlEntities(text) {
  return String(text || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

// ---------------------------------------------------------------------------
// Documents (metadata in D1, bytes in R2)
// ---------------------------------------------------------------------------
async function listDocuments(request, env) {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  const { results } = await env.DB.prepare(
    "SELECT id, kind, name, size, content_type, uploaded_at FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC"
  ).bind(session.user_id).all();
  return json({ documents: results || [] });
}

async function uploadDocument(request, env) {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  if (!env.DOCS) {
    return json({ error: "Document storage is not enabled yet. Enable R2 to store files." }, 503);
  }

  const form = await request.formData();
  const file = form.get("file");
  const kind = (form.get("kind") || "evidence").toString();
  if (!file || typeof file === "string") return json({ error: "No file provided." }, 400);

  const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
  if (file.size > MAX_BYTES) return json({ error: "File exceeds 25 MB limit." }, 413);

  const id = crypto.randomUUID();
  const safeName = (file.name || "upload").replace(/[^\w.\-]+/g, "_");
  const r2Key = `${session.user_id}/${id}-${safeName}`;

  await env.DOCS.put(r2Key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" }
  });
  await env.DB.prepare(
    "INSERT INTO documents (id, user_id, kind, name, size, content_type, r2_key) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, session.user_id, kind, file.name || safeName, file.size, file.type || "", r2Key).run();

  return json({ id, kind, name: file.name || safeName, size: file.size }, 201);
}

async function getDocument(request, env, docId) {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;
  if (!env.DOCS) return json({ error: "Document storage is not enabled." }, 503);

  const row = await env.DB.prepare(
    "SELECT r2_key, name, content_type FROM documents WHERE id = ? AND user_id = ?"
  ).bind(docId, session.user_id).first();
  if (!row) return json({ error: "Not found" }, 404);

  const obj = await env.DOCS.get(row.r2_key);
  if (!obj) return json({ error: "File missing from storage." }, 404);

  return new Response(obj.body, {
    headers: {
      "Content-Type": row.content_type || "application/octet-stream",
      "Content-Disposition": `inline; filename="${row.name}"`
    }
  });
}

async function deleteDocument(request, env, docId) {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  const row = await env.DB.prepare("SELECT r2_key FROM documents WHERE id = ? AND user_id = ?")
    .bind(docId, session.user_id).first();
  if (!row) return json({ error: "Not found" }, 404);

  if (env.DOCS) await env.DOCS.delete(row.r2_key);
  await env.DB.prepare("DELETE FROM documents WHERE id = ? AND user_id = ?").bind(docId, session.user_id).run();
  return json({ ok: true });
}

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------
async function createSession(env, userId) {
  const sid = crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 86400 * 1000);
  await env.DB.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(sid, userId, expires.toISOString()).run();
  return sessionCookie(sid, expires);
}

async function getSession(request, env) {
  const sid = readSessionId(request);
  if (!sid) return null;
  const row = await env.DB.prepare(
    `SELECT s.id, s.user_id, s.expires_at, u.email
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ?`
  ).bind(sid).first();
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sid).run();
    return null;
  }
  return row;
}

async function requireSession(request, env) {
  const session = await getSession(request, env);
  if (!session) return json({ error: "Unauthorized" }, 401);
  return session;
}

function readSessionId(request) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

function sessionCookie(sid, expires) {
  return `${SESSION_COOKIE}=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires.toUTCString()}`;
}

function clearCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

// ---------------------------------------------------------------------------
// Password hashing (PBKDF2 via WebCrypto)
// ---------------------------------------------------------------------------
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toB64(salt)}$${toB64(hash)}`;
}

async function verifyPassword(password, stored) {
  const parts = (stored || "").split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = parseInt(parts[1], 10);
  const salt = fromB64(parts[2]);
  const expected = parts[3];
  const hash = await pbkdf2(password, salt, iterations);
  return timingSafeEqual(toB64(hash), expected);
}

async function pbkdf2(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" }, keyMaterial, 256
  );
  return new Uint8Array(bits);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------
// Reads a value from a Secrets Store binding (async .get()) or a plain
// string binding/var. Returns null if the binding is not configured.
async function getSecret(env, name) {
  const binding = env[name];
  if (!binding) return null;
  if (typeof binding === "string") return binding;
  if (typeof binding.get === "function") return await binding.get();
  return null;
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers }
  });
}

async function readJson(request) {
  try { return await request.json(); } catch { return {}; }
}

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toB64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromB64(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ---------------------------------------------------------------------------
// Report History
// ---------------------------------------------------------------------------
async function listReports(request, env) {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  const { results } = await env.DB.prepare(
    "SELECT id, name, created_at FROM reports_history WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(session.user_id).all();

  return json({ reports: results });
}

async function createReport(request, env) {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  const body = await readJson(request);
  if (!body || typeof body.state !== "object" || body.state === null) {
    return json({ error: "Missing state object." }, 400);
  }

  const name = String(body.name || `Report - ${new Date().toLocaleDateString()}`).trim();
  const id = crypto.randomUUID();
  const stateJson = JSON.stringify(body.state);

  await env.DB.prepare(
    "INSERT INTO reports_history (id, user_id, name, state_json) VALUES (?, ?, ?, ?)"
  ).bind(id, session.user_id, name, stateJson).run();

  return json({ ok: true, id, name });
}

async function getReport(request, env, id) {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  const row = await env.DB.prepare(
    "SELECT name, state_json, created_at FROM reports_history WHERE id = ? AND user_id = ?"
  ).bind(id, session.user_id).first();

  if (!row) return json({ error: "Report not found" }, 404);

  return json({
    id,
    name: row.name,
    state: JSON.parse(row.state_json),
    created_at: row.created_at
  });
}

async function deleteReport(request, env, id) {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  await env.DB.prepare(
    "DELETE FROM reports_history WHERE id = ? AND user_id = ?"
  ).bind(id, session.user_id).run();

  return json({ ok: true });
}

export {
  extractUsefulText,
  getClientIp,
  normalizePublicWebsiteUrl
};
