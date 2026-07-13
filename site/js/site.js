/* Shared shell for GTR multipage site — works under /midterm/ */
(function () {
  const SITE_ROOT_NAME = "midterm";

  function pathParts() {
    return window.location.pathname.replace(/\/index\.html$/, "/").split("/").filter(Boolean);
  }

  /** Absolute site root, e.g. "/midterm/" */
  function siteRoot() {
    const parts = pathParts();
    const i = parts.indexOf(SITE_ROOT_NAME);
    if (i >= 0) return "/" + parts.slice(0, i + 1).join("/") + "/";
    // Local file or unexpected host: fall back to relative resolution
    return null;
  }

  /**
   * Relative base from current page to site root.
   * /midterm/ → ./
   * /midterm/research/ → ../
   * /midterm/research/metrics/ → ../../
   */
  function computeBase() {
    const parts = pathParts();
    const i = parts.indexOf(SITE_ROOT_NAME);
    if (i < 0) {
      // Not under /midterm — treat first segment depth like before
      if (parts.length === 0) return "./";
      if (parts.includes("research")) {
        const idx = parts.lastIndexOf("research");
        const depthAfter = parts.length - idx - 1;
        return depthAfter === 0 ? "../" : "../".repeat(depthAfter + 1);
      }
      const roots = new Set(["research", "prototype", "vision", "leaderboard", "app", "gtr"]);
      if (parts.some((p) => roots.has(p))) return "../";
      return "./";
    }
    const depthAfterRoot = parts.length - i - 1;
    if (depthAfterRoot <= 0) return "./";
    return "../".repeat(depthAfterRoot);
  }

  const base = computeBase();
  const rootAbs = siteRoot() || base;

  const links = [
    { href: base + "index.html", id: "home", label: "Home" },
    { href: base + "research/", id: "research", label: "Research" },
    { href: base + "prototype/", id: "prototype", label: "Prototype" },
    { href: base + "leaderboard/", id: "leaderboard", label: "Leaderboard" },
    { href: base + "vision/", id: "vision", label: "Vision" },
  ];

  function currentId() {
    const path = window.location.pathname;
    if (path.includes("/research")) return "research";
    if (path.includes("/prototype") && !path.includes("prototype1") && !path.includes("prototype2")) {
      return "prototype";
    }
    if (path.includes("/leaderboard")) return "leaderboard";
    if (path.includes("/vision")) return "vision";
    return "home";
  }

  function injectNav() {
    const mount = document.getElementById("site-nav");
    if (!mount) return;
    const cur = currentId();
    const navHtml = links
      .map((l) => {
        const current = l.id === cur;
        return `<a href="${l.href}"${current ? ' aria-current="page"' : ""}>${l.label}</a>`;
      })
      .join("");

    mount.innerHTML = `
      <a class="nav-brand" href="${base}index.html">
        <span class="nav-mark">G</span>
        <span class="nav-brand-text">
          <strong>GTR Handprint</strong>
          <span>Midterm · Climate impact</span>
        </span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Open menu" id="nav-toggle"><span></span></button>
      <nav class="nav-links" id="nav-links">
        ${navHtml}
        <a class="nav-cta" href="${base}prototype/">Try the prototype</a>
      </nav>
    `;

    const toggle = document.getElementById("nav-toggle");
    const navLinks = document.getElementById("nav-links");
    if (toggle && navLinks) {
      toggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    }
  }

  function injectFooter() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;
    const gtr = base + "gtr/";
    mount.innerHTML = `
      <div class="footer-inner">
        <div>
          <p class="footer-brand">GTR Handprint</p>
          <p class="footer-copy">Evidence first. Estimates next. Climate-aware decisions for every kind of early-stage business — footprint and handprint, good or bad.</p>
        </div>
        <div class="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><a href="${base}research/">Research library</a></li>
            <li><a href="${gtr}">Evidence archive</a></li>
            <li><a href="${base}prototype/">Interactive prototype</a></li>
            <li><a href="${base}leaderboard/">Leaderboard prototype</a></li>
            <li><a href="${base}vision/">Next vision</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Also in this build</h4>
          <ul>
            <li><a href="${base}app/">Full product demo</a></li>
            <li><a href="${base}leaderboard/">Impact leaderboard</a></li>
            <li><a href="${base}prototype2/">Dashboard prototype</a></li>
            <li><a href="${gtr}docs/fieldwork-report/">Fieldwork report</a></li>
            <li><a href="${gtr}docs/stage-1/">Stage 1 PRD</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>Midterm site · ${rootAbs}</span>
        <span>Directional model · Not certified carbon accounting</span>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectNav();
    injectFooter();
  });
})();
