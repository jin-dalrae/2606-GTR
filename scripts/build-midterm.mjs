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

function rewriteTree(dir) {
  for (const file of walk(dir)) {
    // Never rewrite self-contained prototype bundles — base64/JSON breaks easily
    // and they resolve paths at runtime via midterm-aware injectShowcaseHeader.
    const rel = relative(MID, file).replace(/\\/g, "/");
    if (rel.startsWith("prototype1/") || rel.startsWith("prototype2/")) continue;

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

// 4) Product demos
mkdirSync(join(MID, "app"), { recursive: true });
cpSync(join(ROOT, "dist", "index.html"), join(MID, "app", "index.html"));
mkdirSync(join(MID, "assets"), { recursive: true });
cpSync(join(ROOT, "dist", "assets"), join(MID, "assets"), { recursive: true });
mkdirSync(join(MID, "prototype0"), { recursive: true });
cpSync(join(ROOT, "dist", "index.html"), join(MID, "prototype0", "index.html"));
mkdirSync(join(MID, "prototype1"), { recursive: true });
cpSync(
  join(ROOT, "Onboarding Assessment Standalone.html"),
  join(MID, "prototype1", "index.html")
);
mkdirSync(join(MID, "prototype2"), { recursive: true });
cpSync(
  join(ROOT, "Dashboard Standalone.html"),
  join(MID, "prototype2", "index.html")
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
    <title>GTR Handprint — Midterm</title>
    <link rel="canonical" href="${BASE}/" />
    <style>
      body { font: 16px/1.5 system-ui, sans-serif; margin: 3rem; color: #16201c; background: #f7f6f2; }
      a { color: #0f5c3c; }
    </style>
  </head>
  <body>
    <p>Redirecting to <a href="${BASE}/">GTR Handprint midterm site</a>…</p>
    <script>location.replace("${BASE}/");</script>
  </body>
</html>
`
);

// 9) 404-friendly midterm index is already present from site/

console.log(`\nMidterm site ready: ${relative(ROOT, MID)}  (base ${BASE}/)`);
console.log(`Root redirect: ${relative(ROOT, join(DIST, "index.html"))} → ${BASE}/`);
