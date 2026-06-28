/* ==========================================================================
   SHARE CARD + SHARE PAGE
   Public, tokenized sharing of a report as grades/bands only (never raw
   tCO2e). Renders an OG PNG card via workers-og and a read-only share
   page with social-unfurl meta tags.
   ========================================================================== */

import { ImageResponse } from "workers-og";
import { computeGrades } from "./grading.js";

const SHARE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS shared_reports (
    token        TEXT PRIMARY KEY,
    company_name TEXT,
    grades_json  TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;

const GRADE_COLOR = {
  A: "#34d399",
  B: "#5eead4",
  C: "#fbbf24",
  D: "#fb923c",
  F: "#f87171"
};

function originOf(env, request) {
  if (env && env.PUBLIC_ORIGIN) return env.PUBLIC_ORIGIN;
  try { return new URL(request.url).origin; } catch { return "https://2606gtr.dalrae-jin-work.workers.dev"; }
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers }
  });
}

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function createShare(request, env) {
  await env.DB.prepare(SHARE_SCHEMA).run();
  let body;
  try { body = await request.json(); } catch { body = {}; }
  const assessment = body.assessment;
  if (!assessment || typeof assessment !== "object" || !assessment.snapshot) {
    return jsonResponse({ error: "Missing assessment with a snapshot." }, 400);
  }
  const grades = computeGrades(assessment);
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 22);
  await env.DB.prepare(
    "INSERT INTO shared_reports (token, company_name, grades_json) VALUES (?, ?, ?)"
  ).bind(token, grades.companyName, JSON.stringify(grades)).run();

  const origin = originOf(env, request);
  return jsonResponse({
    token,
    shareUrl: `${origin}/s/${token}`,
    imageUrl: `${origin}/api/share/${token}/image.png`,
    grades
  }, 201);
}

async function loadShare(env, token) {
  if (!/^[A-Za-z0-9]{8,40}$/.test(token)) return null;
  await env.DB.prepare(SHARE_SCHEMA).run();
  const row = await env.DB.prepare(
    "SELECT token, company_name, grades_json, created_at FROM shared_reports WHERE token = ?"
  ).bind(token).first();
  if (!row) return null;
  let grades;
  try { grades = JSON.parse(row.grades_json); } catch { return null; }
  return { token: row.token, companyName: row.company_name, grades, createdAt: row.created_at };
}

export async function getShare(env, token) {
  const share = await loadShare(env, token);
  if (!share) return jsonResponse({ error: "Share not found." }, 404);
  return jsonResponse({ token: share.token, grades: share.grades, createdAt: share.createdAt });
}

export async function deleteShare(env, token) {
  if (!/^[A-Za-z0-9]{8,40}$/.test(token)) return jsonResponse({ error: "Invalid token." }, 400);
  await env.DB.prepare(SHARE_SCHEMA).run();
  await env.DB.prepare("DELETE FROM shared_reports WHERE token = ?").bind(token).run();
  return jsonResponse({ ok: true });
}

export async function shareImage(env, request, token) {
  const share = await loadShare(env, token);
  if (!share) return new Response("Not found", { status: 404 });
  const g = share.grades;
  const gradeColor = GRADE_COLOR[g.impactGrade] || GRADE_COLOR.C;

  const html = `<div style="display:flex;flex-direction:column;width:1200px;height:630px;padding:64px;background:linear-gradient(135deg,#0b1120 0%,#0f1b2e 60%,#13243b 100%);color:#e6edf5;font-family:sans-serif;"><div style="display:flex;align-items:center;font-size:28px;font-weight:600;color:#5eead4;"><div style="display:flex;width:18px;height:18px;border-radius:50%;background:#34d399;margin-right:14px;"></div><div style="display:flex;">SOCIAL LAB \u00b7 CLIMATE IMPACT</div></div><div style="display:flex;font-size:60px;font-weight:700;margin-top:32px;">${escapeHtml(g.companyName)}</div><div style="display:flex;align-items:center;margin-top:36px;"><div style="display:flex;align-items:center;justify-content:center;width:150px;height:150px;border-radius:28px;background:${gradeColor};color:#08111f;font-size:96px;font-weight:800;">${escapeHtml(g.impactGrade)}</div><div style="display:flex;flex-direction:column;margin-left:36px;"><div style="display:flex;font-size:26px;color:#9fb0c3;">Impact grade</div><div style="display:flex;font-size:44px;font-weight:700;margin-top:6px;">${escapeHtml(g.gradeHeadline)}</div></div></div><div style="display:flex;flex-direction:column;margin-top:40px;font-size:30px;"><div style="display:flex;align-items:center;"><div style="display:flex;width:12px;height:12px;border-radius:50%;background:#5eead4;margin-right:16px;"></div><div style="display:flex;">Footprint: ${escapeHtml(g.footprintBandLabel)}</div></div><div style="display:flex;align-items:center;margin-top:14px;"><div style="display:flex;width:12px;height:12px;border-radius:50%;background:#34d399;margin-right:16px;"></div><div style="display:flex;">Handprint: ${escapeHtml(g.handprintLabel)}</div></div><div style="display:flex;align-items:center;margin-top:14px;"><div style="display:flex;width:12px;height:12px;border-radius:50%;background:#fbbf24;margin-right:16px;"></div><div style="display:flex;">Data maturity: ${escapeHtml(g.maturityLabel)}</div></div></div><div style="display:flex;margin-top:48px;font-size:24px;color:#7c8da3;">Modeled with Social Lab \u2014 grades only, no raw figures shared.</div></div>`;

  let font;
  try {
    const { loadGoogleFont } = await import("workers-og");
    font = await loadGoogleFont({ family: "DM Sans", weight: 700 });
  } catch {
    font = null;
  }

  const options = { width: 1200, height: 630, format: "png" };
  if (font) options.fonts = [{ name: "DM Sans", data: font, weight: 700, style: "normal" }];

  try {
    const resp = new ImageResponse(html, options);
    const buf = await resp.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (err) {
    return new Response(`Image generation failed: ${err && err.message || err}`, { status: 500 });
  }
}

export async function sharePage(env, request, token) {
  const share = await loadShare(env, token);
  const origin = originOf(env, request);
  if (!share) {
    return new Response(`<!doctype html><meta charset="utf-8"><title>Share not found</title><body style="font-family:sans-serif;background:#0b1120;color:#e6edf5;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h1>This share link has expired or was revoked.</h1><p><a style="color:#5eead4" href="${origin}">Run your own free assessment →</a></p></div>`, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
  const g = share.grades;
  const imageUrl = `${origin}/api/share/${share.token}/image.png`;
  const shareUrl = `${origin}/s/${share.token}`;
  const title = `${g.companyName} — Climate impact grade ${g.impactGrade}`;
  const desc = `${g.gradeHeadline}. Footprint ${g.footprintBandLabel.toLowerCase()}; handprint ${g.handprintStatus}; data maturity ${g.maturityLabel.toLowerCase()}. Modeled with Social Lab.`;

  const gradeColor = GRADE_COLOR[g.impactGrade] || GRADE_COLOR.C;
  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:image" content="${escapeHtml(imageUrl)}">
<meta property="og:url" content="${escapeHtml(shareUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
<meta name="twitter:image" content="${escapeHtml(imageUrl)}">
<style>
  body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#0b1120;color:#e6edf5;line-height:1.5}
  .wrap{max-width:760px;margin:0 auto;padding:48px 24px}
  .brand{font-size:14px;letter-spacing:1px;color:#5eead4;font-weight:600;text-transform:uppercase}
  h1{font-size:2.2rem;margin:.5rem 0 1.5rem}
  .card{background:#0f1b2e;border:1px solid #1e3050;border-radius:16px;padding:28px;display:flex;gap:24px;align-items:center}
  .grade{width:110px;height:110px;border-radius:20px;background:${gradeColor};color:#08111f;font-size:64px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .rows{margin:24px 0;display:flex;flex-direction:column;gap:10px}
  .row{display:flex;gap:12px;align-items:center;font-size:1rem}
  .dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
  .note{font-size:.85rem;color:#9fb0c3;font-style:italic}
  .cta{display:inline-block;margin-top:24px;background:#34d399;color:#08111f;font-weight:600;padding:.75rem 1.5rem;border-radius:10px;text-decoration:none}
  img.preview{width:100%;border-radius:16px;border:1px solid #1e3050;margin-top:24px}
</style>
</head><body>
<div class="wrap">
  <div class="brand">◇ Social Lab · Climate Impact</div>
  <h1>${escapeHtml(g.companyName)}</h1>
  <div class="card">
    <div class="grade">${escapeHtml(g.impactGrade)}</div>
    <div>
      <div style="color:#9fb0c3;font-size:.9rem">Impact grade</div>
      <div style="font-size:1.5rem;font-weight:700">${escapeHtml(g.gradeHeadline)}</div>
    </div>
  </div>
  <div class="rows">
    <div class="row"><span class="dot" style="background:#5eead4"></span> Footprint: ${escapeHtml(g.footprintBandLabel)}</div>
    <div class="row"><span class="dot" style="background:#34d399"></span> Handprint: ${escapeHtml(g.handprintLabel)}</div>
    <div class="row"><span class="dot" style="background:#fbbf24"></span> Data maturity: ${escapeHtml(g.maturityLabel)}</div>
  </div>
  <p class="note">Grades only — no raw emissions figures are shared. This is a directional model, not certified carbon accounting.</p>
  <img class="preview" src="${escapeHtml(imageUrl)}" alt="Climate impact grade card for ${escapeHtml(g.companyName)}">
  <a class="cta" href="${origin}">Run your own free assessment →</a>
</div>
</body></html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
