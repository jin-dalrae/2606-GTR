#!/usr/bin/env node
/**
 * Build the multipage midterm site into showcase/dist/midterm/
 * and a root redirect at showcase/dist/index.html → /midterm/
 */
import { execSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "showcase", "dist");
const MID = join(DIST, "midterm");
const BASE = "/midterm";

function sh(cmd) {
  console.log(">", cmd);
  execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function rewriteText(text) {
  return text
    // Evidence + cosmos + absolute assets used by the GTR archive SPA
    .replaceAll('"/gtr/', `"${BASE}/gtr/`)
    .replaceAll("'/gtr/", `'${BASE}/gtr/`)
    .replaceAll("`/gtr/", `\`${BASE}/gtr/`)
    .replaceAll("(/gtr/", `(${BASE}/gtr/`)
    .replaceAll('"/cosmos/', `"${BASE}/cosmos/`)
    .replaceAll("'/cosmos/", `'${BASE}/cosmos/`)
    .replaceAll('href="/assets/', `href="${BASE}/assets/`)
    .replaceAll("href='/assets/", `href='${BASE}/assets/`)
    .replaceAll('src="/assets/', `src="${BASE}/assets/`)
    .replaceAll("src='/assets/", `src='${BASE}/assets/`)
    .replaceAll('url("/assets/', `url("${BASE}/assets/`)
    .replaceAll("url('/assets/", `url('${BASE}/assets/`)
    .replaceAll('url(/assets/', `url(${BASE}/assets/`)
    // Site return chip + bare home
    .replaceAll('href="/">', `href="${BASE}/">`)
    .replaceAll("href='/'>", `href='${BASE}/'>`)
    // Vite SPA module URLs written as absolute /assets/...
    .replaceAll('src="/assets/', `src="${BASE}/assets/`)
    .replaceAll('href="/assets/', `href="${BASE}/assets/`);
}

/**
 * Full-bleed mobile variant of the onboarding assessment:
 * drop the 380×760 phone bezel, fill the viewport, keep internal overflow-y scroll.
 */
function makeMobileOnboardingApp(sourceHtml) {
  let out = sourceHtml;
  out = out.replace(
    "body{margin:0}",
    "html,body{height:100%;margin:0;overflow:hidden;overscroll-behavior:none}body{margin:0}"
  );
  out = out.replace(
    "min-height:100vh;width:100%;background:#dedcd5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:28px 16px",
    "height:100%;min-height:100dvh;width:100%;background:#fbfaf7;display:flex;flex-direction:column;align-items:stretch;justify-content:stretch;gap:0;padding:0;overflow:hidden;touch-action:manipulation"
  );
  out = out.replace(
    "position:relative;width:380px;height:760px;background:#fbfaf7;border:1px solid #e6e4dd;border-radius:32px;overflow:hidden",
    "position:relative;width:100%;height:100%;flex:1;min-height:0;background:#fbfaf7;border:none;border-radius:0;overflow:hidden"
  );
  out = out.replace(
    "showDeviceFrame&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true",
    "showDeviceFrame&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:false"
  );
  // Hide desktop caption under the phone shell
  out = out.replace(
    '<div style=\\"font-size:12px;color:#8a8983;font-family:ui-monospace,monospace\\">Onboarding assessment · mobile wireframe<\\u002Fdiv>',
    ""
  );
  return out;
}

function rewriteTree(dir) {
  for (const file of walk(dir)) {
    // Never rewrite self-contained prototype bundles — base64/JSON breaks easily
    // and they resolve paths at runtime via midterm-aware injectShowcaseHeader.
    const rel = relative(MID, file).replace(/\\/g, "/");
    if (
      /^prototype[0-4](\b|\/)/.test(rel) ||
      rel.startsWith("posters/main/") ||
      rel === "prototype/mobile/app.html"
    ) {
      continue;
    }

    if (!/\.(html?|js|css|jsx|json|md|svg)$/i.test(file)) continue;
    const before = readFileSync(file, "utf8");
    const after = rewriteText(before);
    if (after !== before) writeFileSync(file, after);
  }
}

// 1) Product SPA
sh("npx vite build");

// 2) Clean dist and stage midterm
rmSync(DIST, { recursive: true, force: true });
mkdirSync(MID, { recursive: true });

// 3) Marketing multipage site
cpSync(join(ROOT, "site"), MID, { recursive: true });

// 4) Product demos — Jul 12 multi-role prototype set
mkdirSync(join(MID, "app"), { recursive: true });
cpSync(join(ROOT, "dist", "index.html"), join(MID, "app", "index.html"));
mkdirSync(join(MID, "assets"), { recursive: true });
cpSync(join(ROOT, "dist", "assets"), join(MID, "assets"), { recursive: true });
mkdirSync(join(MID, "prototype0"), { recursive: true });
cpSync(join(ROOT, "dist", "index.html"), join(MID, "prototype0", "index.html"));

// 1 · Founder assessment (desktop phone-frame shell)
mkdirSync(join(MID, "prototype1"), { recursive: true });
const onboardingSrc = join(ROOT, "Onboarding Assessment Standalone.html");
cpSync(onboardingSrc, join(MID, "prototype1", "index.html"));

// 1b · True full-screen mobile onboarding (no bezel) for /midterm/prototype/mobile/
mkdirSync(join(MID, "prototype", "mobile"), { recursive: true });
writeFileSync(
  join(MID, "prototype", "mobile", "app.html"),
  makeMobileOnboardingApp(readFileSync(onboardingSrc, "utf8"))
);

// 2 · Founder dashboard — interactive mockup (primary) + optional mobile shell
mkdirSync(join(MID, "prototype2"), { recursive: true });
cpSync(
  join(ROOT, "Dashboard_Mockup_Interactive.html"),
  join(MID, "prototype2", "index.html")
);
mkdirSync(join(MID, "prototype2", "mobile"), { recursive: true });
cpSync(
  join(ROOT, "Dashboard Standalone.html"),
  join(MID, "prototype2", "mobile", "index.html")
);
// legacy desktop wireframe path (kept for old links)
mkdirSync(join(MID, "prototype2", "desktop"), { recursive: true });
cpSync(
  join(ROOT, "Dashboard_Mockup_Interactive.html"),
  join(MID, "prototype2", "desktop", "index.html")
);

// 3 · Investor portfolio board
mkdirSync(join(MID, "prototype3"), { recursive: true });
cpSync(
  join(ROOT, "Climate Risk Portfolio Dashboard (Investors).html"),
  join(MID, "prototype3", "index.html")
);

// 4 · Program / incubator director cohort board
mkdirSync(join(MID, "prototype4"), { recursive: true });
cpSync(
  join(ROOT, "Program Director Dashboard.html"),
  join(MID, "prototype4", "index.html")
);

// 5) Evidence archive + cosmos styles + images
cpSync(join(ROOT, "evidence", "gtr"), join(MID, "gtr"), { recursive: true });
mkdirSync(join(MID, "cosmos"), { recursive: true });
cpSync(
  join(ROOT, "evidence", "cosmos", "styles.css"),
  join(MID, "cosmos", "styles.css")
);
cpSync(
  join(ROOT, "evidence", "assets", "cadinal_logo.png"),
  join(MID, "assets", "cadinal_logo.png")
);
mkdirSync(join(MID, "assets", "images"), { recursive: true });
cpSync(
  join(ROOT, "evidence", "assets", "images", "gtr"),
  join(MID, "assets", "images", "gtr"),
  { recursive: true }
);

// 6) Optional research notes deck
mkdirSync(join(MID, "research-notes"), { recursive: true });
cpSync(join(ROOT, "research"), join(MID, "research-notes"), { recursive: true });

// 7) Rewrite absolute paths for /midterm base
rewriteTree(MID);

// 8) Root redirect
writeFileSync(
  join(DIST, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=${BASE}/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Climatico — Midterm</title>
    <link rel="canonical" href="${BASE}/" />
    <style>
      body { font: 16px/1.5 system-ui, sans-serif; margin: 3rem; color: #16201c; background: #f7f6f2; }
      a { color: #0f5c3c; }
    </style>
  </head>
  <body>
    <p>Redirecting to <a href="${BASE}/">Climatico midterm site</a>…</p>
    <script>location.replace("${BASE}/");</script>
  </body>
</html>
`
);

// 9) 404-friendly midterm index is already present from site/

console.log(`\nMidterm site ready: ${relative(ROOT, MID)}  (base ${BASE}/)`);
console.log(`Root redirect: ${relative(ROOT, join(DIST, "index.html"))} → ${BASE}/`);
