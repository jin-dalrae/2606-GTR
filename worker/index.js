/* ==========================================================================
   CLIMATE IMPACT DASHBOARD — Worker API
   Serves /api/* (accounts, workspace state, documents) and falls back to the
   static SPA assets for everything else. No external dependencies.
   ========================================================================== */

const SESSION_COOKIE = "sid";
const SESSION_TTL_DAYS = 30;
const PBKDF2_ITERATIONS = 100000;

// Gemini config — kept tight to control API spend.
const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";
const GEMINI_MAX_OUTPUT_TOKENS = 1100;
const WEBSITE_FETCH_TIMEOUT_MS = 3500;
const WEBSITE_CONTEXT_MAX_BYTES = 64 * 1024;
const WEBSITE_CONTEXT_MAX_CHARS = 1800;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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

  if (path === "/api/generate-report" && method === "POST") return generateReport(request, env);

  if (path === "/api/documents" && method === "GET") return listDocuments(request, env);
  if (path === "/api/documents" && method === "POST") return uploadDocument(request, env);
  const docMatch = path.match(/^\/api\/documents\/([A-Za-z0-9_-]+)$/);
  if (docMatch && method === "GET") return getDocument(request, env, docMatch[1]);
  if (docMatch && method === "DELETE") return deleteDocument(request, env, docMatch[1]);

  return json({ error: "Not found" }, 404);
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

// ---------------------------------------------------------------------------
// AI report + dashboard fill (Gemini). Auth-gated; one call returns both.
// ---------------------------------------------------------------------------
async function generateReport(request, env) {
  const session = await requireSession(request, env);
  if (session instanceof Response) return session;

  const apiKey = await getSecret(env, "AI_API_KEY");
  if (!apiKey) {
    return json({ error: "AI is not configured yet. Add the Gemini key to the secret store." }, 503);
  }

  const body = await readJson(request);
  const a = body.assessment || {};
  const websiteContext = await fetchWebsiteContext(a.url);
  const prompt = buildReportPrompt(a, { websiteContext, asOfDate: new Date().toISOString().slice(0, 10) });
  const schema = buildReportSchema();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
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

  return json({ report });
}

function buildReportPrompt(assessment, context = {}) {
  const a = assessment || {};
  const snapshot = a.snapshot || {};
  const websiteContext = context.websiteContext || {};
  const asOfDate = context.asOfDate || new Date().toISOString().slice(0, 10);
  const activities = (a.activities || []).join(", ");
  const hotspots = (snapshot.hotspots || [])
    .map(h => `${h.name} (~${formatNumber(h.value)} tCO2e/yr)`)
    .join(", ");
  const breakdown = (snapshot.breakdown || [])
    .map(h => `${h.name}: ${formatNumber(h.value)} tCO2e/yr, Scope ${h.scope}, ${h.unc}% uncertainty`)
    .join("; ");
  const docs = [a.docs && a.docs.deck, a.docs && a.docs.accounting].filter(Boolean).join(", ");

  return [
    "You are a climate-impact analyst advising an early-stage startup founder.",
    "Write a concise briefing that is grounded in the specific company situation below.",
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
    "Evidence and realism rules:",
    "- You have no browsing tools beyond the supplied public website context; do not imply you inspected pages not shown here.",
    "- You did not read source files. Treat selected document filenames as workflow clues only, not evidence.",
    "- Treat footprint values as modeled defaults, not measured accounting.",
    "- Tie every issue and goal to the founder notes, website context, selected activities, stage, business model, or hotspots.",
    "- If geography, customer segment, suppliers, or revenue thresholds are unknown, make the dependency explicit instead of inventing facts.",
    "- Do not say CSRD, SEC, California SB 253/SB 261, CBAM, EUDR, or zero-emission-zone rules apply directly unless the supplied context supports that. Prefer conditional language such as 'if selling into EU enterprise customers' or 'if operating urban delivery fleets'.",
    "- Name only real regulations, standards, or market trends, and include why the trigger is plausible for this company.",
    "- If the situation is too thin, say the first action is to verify the missing operational data, not to claim precision.",
    "",
    "Return a founder-facing JSON report. Include a basis field naming the real context used and any key missing assumption. Keep every field tight, practical, and specific. The Risk Radar must contain 2 to 4 dated risks with concrete actions."
  ].join("\n");
}

function buildReportSchema() {
  return {
    type: "object",
    properties: {
      headline: { type: "string", description: "1-2 sentence key insight grounded in the supplied company context" },
      basis: { type: "string", description: "One sentence naming facts used from notes, website context, selected activities, or hotspots; include the key assumption if context is thin" },
      issues: {
        type: "array",
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
      }
    },
    required: ["headline", "basis", "issues", "regulation", "firstAction", "goalPriorities", "risks"]
  };
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

function formatWebsiteContext(context) {
  if (!context || context.status === "not_provided") return "not provided";
  return `[${context.status}${context.url ? ` from ${context.url}` : ""}] ${cleanPromptValue(context.text, WEBSITE_CONTEXT_MAX_CHARS) || "n/a"}`;
}

function cleanPromptValue(value, maxChars = 600) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, maxChars);
}

function formatNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(1) : "?";
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

export {
  buildReportPrompt,
  buildReportSchema,
  extractUsefulText,
  normalizePublicWebsiteUrl
};
