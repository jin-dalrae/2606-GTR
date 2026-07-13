/* Shared shell for Climatico multipage site — works under /midterm/ */
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
    return null;
  }

  /**
   * Relative base from current page to site root.
   */
  function computeBase() {
    const parts = pathParts();
    const i = parts.indexOf(SITE_ROOT_NAME);
    if (i < 0) {
      if (parts.length === 0) return "./";
      if (parts.includes("research")) {
        const idx = parts.lastIndexOf("research");
        const depthAfter = parts.length - idx - 1;
        return depthAfter === 0 ? "../" : "../".repeat(depthAfter + 1);
      }
      const roots = new Set(["research", "prototype", "vision", "leaderboard", "app", "gtr", "posters"]);
      if (parts.some((p) => roots.has(p))) return "../";
      return "./";
    }
    const depthAfterRoot = parts.length - i - 1;
    if (depthAfterRoot <= 0) return "./";
    return "../".repeat(depthAfterRoot);
  }

  const base = computeBase();

  const links = [
    { href: base + "index.html", id: "home", label: "Home" },
    { href: base + "research/", id: "research", label: "Research" },
    { href: base + "prototype/", id: "prototype", label: "Prototype" },
    { href: base + "posters/", id: "posters", label: "Posters" },
  ];

  function currentId() {
    const path = window.location.pathname;
    if (path.includes("/research")) return "research";
    if (path.includes("/prototype") && !path.includes("prototype1") && !path.includes("prototype2")) {
      return "prototype";
    }
    if (path.includes("/leaderboard")) return "prototype";
    if (path.includes("/posters")) return "posters";
    if (path.includes("/vision")) return "home";
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
        <span class="nav-mark">C</span>
        <span class="nav-brand-text">
          <strong>Climatico</strong>
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
          <p class="footer-brand">Climatico</p>
          <p class="footer-copy">Climatico is an environmental impact dashboard for early-stage startups. We help startups to scale sustainably from day one.</p>
        </div>
        <div class="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><a href="${base}research/">Research library</a></li>
            <li><a href="${gtr}">Evidence archive</a></li>
            <li><a href="${base}prototype/">Interactive prototype</a></li>
            <li><a href="${base}posters/">Poster series</a></li>
            <li><a href="${base}index.html#vision">Vision on home</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Also in this build</h4>
          <ul>
            <li><a href="${base}app/">Full product demo</a></li>
            <li><a href="${base}prototype2/">Founder dashboard</a></li>
            <li><a href="${base}prototype3/">Investor portfolio</a></li>
            <li><a href="${base}prototype4/">Program director</a></li>
            <li><a href="${gtr}docs/fieldwork-report/">Fieldwork report</a></li>
            <li><a href="${gtr}docs/stage-1/">Stage 1 PRD</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>Climatico</span>
        <span style="color:var(--accent-deep);font-weight:500">Rae · Gabriel · Tej</span>
        <span>gtr1.web.app</span>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectNav();
    injectFooter();
  });
})();
