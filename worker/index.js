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
const GEMINI_MAX_OUTPUT_TOKENS = 600;

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
  const snapshot = a.snapshot || {};
  const hotspots = (snapshot.hotspots || []).map(h => `${h.name} (~${h.value} tCO2e/yr)`).join(", ");
  const activities = (a.activities || []).join(", ");

  const prompt =
    `You are a climate-impact analyst advising an early-stage startup founder. Be concrete, ` +
    `specific to their sector, and brutally concise — no filler, no hedging.\n\n` +
    `Company: ${a.name || "Unknown"}\n` +
    `Stage: ${a.stage || "Unknown"} | Business model: ${a.businessModel || "Unknown"} | Team: ${a.teamSize || "?"} FTEs\n` +
    `Activities: ${activities || "n/a"}\n` +
    `Modeled annual footprint: ${snapshot.footprintTotal != null ? snapshot.footprintTotal.toFixed(1) : "?"} tCO2e/yr\n` +
    `Top hotspots: ${hotspots || "n/a"}\n` +
    `Uploaded documents: ${[a.docs && a.docs.deck, a.docs && a.docs.accounting].filter(Boolean).join(", ") || "none"}\n\n` +
    `Write a short founder-facing impact briefing. Name a real, named regulation that is forcing ` +
    `companies like this to act, and one unexpected second-order effect to watch. Keep every field tight.`;

  const schema = {
    type: "object",
    properties: {
      headline: { type: "string", description: "1-2 sentence key insight" },
      issues: {
        type: "array",
        items: {
          type: "object",
          properties: { title: { type: "string" }, detail: { type: "string" } },
          required: ["title", "detail"]
        }
      },
      regulation: { type: "string", description: "One sentence: the law/regulation forcing action" },
      unexpected: { type: "string", description: "One sentence: an unexpected second-order effect + rough timing" },
      firstAction: { type: "string", description: "One sentence: the recommended first move" },
      goalPriorities: { type: "array", items: { type: "string" }, description: "Up to 3 short goal titles" }
    },
    required: ["headline", "issues", "regulation", "firstAction", "goalPriorities"]
  };

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
