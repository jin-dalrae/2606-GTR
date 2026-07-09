/* GTR evidence archive shell — path-aware for /midterm/gtr and /gtr */

/** Resolve archive root, e.g. "/midterm/gtr" or "/gtr" */
export function gtrBase() {
  if (typeof window === "undefined") return "/midterm/gtr";
  const path = window.location.pathname;
  const m = path.match(/^(.*?\/gtr)(?=\/|$)/);
  if (m) return m[1].replace(/\/$/, "") || "/gtr";
  // fallback when opened from unexpected host
  if (path.includes("/midterm")) return "/midterm/gtr";
  return "/gtr";
}

function siteHome() {
  const base = gtrBase();
  if (base.startsWith("/midterm")) return "/midterm/";
  return "/";
}

function href(path = "/") {
  const base = gtrBase();
  if (!path || path === "/") return base + "/";
  return base + (path.startsWith("/") ? path : "/" + path);
}

export const gtrPages = () => [
  ["intro", "0", "Overview", href("/")],
  ["first-prototype", "1", "First Prototype", href("/docs/stage-1/")],
  ["second-prototype", "2", "Second Prototype", href("/docs/stage-2/")],
];

export const firstPrototypeChildren = () => [
  ["stage-1", "1.1", "Stage 1 PRD", href("/docs/stage-1/")],
  ["fieldwork-report", "1.2", "Fieldwork Report", href("/docs/fieldwork-report/")],
  ["fieldwork-feedback", "1.3", "Presentation Feedback", href("/docs/fieldwork-report/feedback/")],
];

export const secondPrototypeChildren = () => [
  ["stage-2", "2.1", "Stage 2 PRD", href("/docs/stage-2/")],
];

export const stage2PrdChildren = [];

export const fieldworkSlide = () => ({
  id: "fieldwork-slides",
  label: "Fieldwork slides",
  path: href("/docs/fieldwork-report/slides/"),
  slug: "gtr-fieldwork-week",
});

export const fieldworkFeedback = () => ({
  id: "fieldwork-feedback",
  label: "Presentation feedback",
  path: href("/docs/fieldwork-report/feedback/"),
});

export const fieldworkSubnav = () => [fieldworkSlide()];

// Back-compat aliases used by app.jsx (recomputed each render via helpers below)
export { href as gtrHref };

export function GTRMark() {
  return <span className="wordmark-mark"><i /><i /><i /></span>;
}

export function GTRHeader({ meta = "Docs archive · 2026" }) {
  const [open, setOpen] = React.useState(false);
  const pages = gtrPages();
  const firstKids = firstPrototypeChildren();
  const secondKids = secondPrototypeChildren();
  const fwSlide = fieldworkSlide();

  return (
    <header className="site-header">
      <a className="wordmark" href={href("/")} aria-label="GTR home">
        <GTRMark /> GTR
      </a>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open}>Menu</button>
      <nav className={open ? "top-nav is-open" : "top-nav"} aria-label="GTR navigation">
        <a href={siteHome()} onClick={() => setOpen(false)}>← Midterm site</a>
        {pages.map(([id, number, label, path]) => (
          <React.Fragment key={id}>
            <a href={path} onClick={() => setOpen(false)}>{label}</a>
            {id === "first-prototype" && firstKids.map(([subId, , subLabel, subPath]) => (
              <React.Fragment key={subId}>
                <a className="top-nav-child" href={subPath} onClick={() => setOpen(false)}>↳ {subLabel}</a>
                {subId === "fieldwork-report" && (
                  <a className="top-nav-child top-nav-child--nested" href={fwSlide.path} onClick={() => setOpen(false)}>
                    ↳ {fwSlide.label}
                  </a>
                )}
              </React.Fragment>
            ))}
            {id === "second-prototype" && secondKids.map(([subId, , subLabel, subPath]) => (
              <a className="top-nav-child" key={subId} href={subPath} onClick={() => setOpen(false)}>↳ {subLabel}</a>
            ))}
          </React.Fragment>
        ))}
      </nav>
      <p className="header-meta">{meta}</p>
    </header>
  );
}

/**
 * Flat, always-expanded chapter rail — no collapsible toggles that hide routes.
 * Structure mirrors the original archive: Overview → Stage 1 / Fieldwork → Stage 2.
 */
export function GTRSidebar({ active, subActive }) {
  const firstKids = firstPrototypeChildren();
  const secondKids = secondPrototypeChildren();
  const fwSlide = fieldworkSlide();

  const itemClass = (isActive) => (isActive ? "active" : "");

  return (
    <aside className="chapter-rail" aria-label="GTR archive">
      <div className="rail-intro">
        <p>Evidence archive</p>
        <h2>GTR</h2>
        <span>Climate Goal Platform research, fieldwork, and PRDs</span>
        <a className="rail-home-link" href={siteHome()}>← Back to midterm site</a>
      </div>

      <nav>
        <p>Index</p>

        <a className={itemClass(active === "intro")} href={href("/")}>
          <span>0</span><b>Overview</b><i>→</i>
        </a>
        <p className="rail-section-label">Research report</p>
        <a className={itemClass(active === "intro")} href={href("/#research-summary")}>
          <span>·</span><b>Executive summary</b><i>→</i>
        </a>
        <a className={itemClass(false)} href={href("/#research-direction")}>
          <span>·</span><b>Rescoped direction</b><i>→</i>
        </a>
        <a className={itemClass(false)} href={href("/#research-model")}>
          <span>·</span><b>+/− impact model</b><i>→</i>
        </a>

        <p className="rail-section-label">1 · First prototype</p>
        {firstKids.map(([id, number, label, path]) => (
          <React.Fragment key={id}>
            <a
              className={`rail-item--depth-1 ${itemClass(active === "first-prototype" && subActive === id)}`}
              href={path}
            >
              <span>{number}</span><b>{label}</b><i>→</i>
            </a>
            {id === "fieldwork-report" && (
              <div className="rail-subnav rail-subnav--always">
                <a
                  className={itemClass(active === "first-prototype" && subActive === fwSlide.id)}
                  href={fwSlide.path}
                >
                  <span>↳</span><b>{fwSlide.label}</b><i>→</i>
                </a>
              </div>
            )}
          </React.Fragment>
        ))}

        <p className="rail-section-label">2 · Second prototype</p>
        {secondKids.map(([id, number, label, path]) => (
          <a
            key={id}
            className={`rail-item--depth-1 ${itemClass(active === "second-prototype" && subActive === id)}`}
            href={path}
          >
            <span>{number}</span><b>{label}</b><i>→</i>
          </a>
        ))}

        <p className="rail-section-label">Decks</p>
        <a
          className={itemClass(active === "first-prototype" && subActive === "product-deck")}
          href={href("/slides/climate-goal-platform/")}
        >
          <span>D</span><b>Product deck</b><i>→</i>
        </a>
        <a
          className={itemClass(active === "first-prototype" && subActive === "partners-deck")}
          href={href("/slides/gtr-partners/")}
        >
          <span>P</span><b>GTR Partners</b><i>→</i>
        </a>
      </nav>

      <div className="rail-status"><i /> GTR archive <span>2026</span></div>
    </aside>
  );
}
