export const gtrPages = [
  ["intro", "0", "Overview", "/gtr/"],
  ["first-prototype", "1", "First Prototype", "/gtr/docs/stage-1/"],
  ["second-prototype", "2", "Second Prototype", "/gtr/docs/stage-2/"],
];

export const firstPrototypeChildren = [
  ["stage-1", "1.1", "Stage 1 PRD", "/gtr/docs/stage-1/"],
  ["fieldwork-report", "1.2", "Fieldwork Report", "/gtr/docs/fieldwork-report/"],
  ["fieldwork-feedback", "1.3", "Presentation Feedback", "/gtr/docs/fieldwork-report/feedback/"],
];

export const secondPrototypeChildren = [
  ["stage-2", "2.1", "Stage 2 PRD", "/gtr/docs/stage-2/"],
];

export const stage2PrdChildren = [];

export const fieldworkSlide = {
  id: "fieldwork-slides",
  label: "Fieldwork slides",
  path: "/gtr/docs/fieldwork-report/slides/",
  slug: "gtr-fieldwork-week",
};

export const fieldworkFeedback = {
  id: "fieldwork-feedback",
  label: "Presentation feedback",
  path: "/gtr/docs/fieldwork-report/feedback/",
};

export const fieldworkSubnav = [fieldworkSlide];

const reportChildren = {
  "first-prototype": firstPrototypeChildren,
  "second-prototype": secondPrototypeChildren,
};

const reportGrandchildren = {
  "stage-2": stage2PrdChildren,
};

export function GTRMark() {
  return <span className="wordmark-mark"><i /><i /><i /></span>;
}

export function GTRHeader({ meta = "Docs archive · 2026" }) {
  const [open, setOpen] = React.useState(false);
  return (
    <header className="site-header">
      <a className="wordmark" href="/gtr/" aria-label="GTR home">
        <GTRMark /> GTR
      </a>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open}>Menu</button>
      <nav className={open ? "top-nav is-open" : "top-nav"} aria-label="GTR navigation">
        {gtrPages.map(([id, number, label, path]) => (
          <React.Fragment key={id}>
            <a href={path} onClick={() => setOpen(false)}>{label}</a>
            {reportChildren[id]?.map(([subId, , subLabel, subPath]) => (
              <React.Fragment key={subId}>
                <a className="top-nav-child" href={subPath} onClick={() => setOpen(false)}>↳ {subLabel}</a>
                {reportGrandchildren[subId]?.map(([gsId, , gsLabel, gsPath]) => (
                  <a className="top-nav-child top-nav-child--nested" key={gsId} href={gsPath} onClick={() => setOpen(false)}>↳ {gsLabel}</a>
                ))}
                {subId === "fieldwork-report" && fieldworkSubnav.map((item) => (
                  <a className="top-nav-child top-nav-child--nested" key={item.id} href={item.path} onClick={() => setOpen(false)}>↳ {item.label}</a>
                ))}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </nav>
      <p className="header-meta">{meta}</p>
    </header>
  );
}

const SIDEBAR_OPEN_KEY = "gtr-sidebar-open-v1";

function loadSidebarState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SIDEBAR_OPEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      firstPrototype: !!parsed.firstPrototype,
      secondPrototype: !!parsed.secondPrototype,
    };
  } catch {
    return null;
  }
}

function saveSidebarState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SIDEBAR_OPEN_KEY, JSON.stringify(state));
  } catch {
  }
}

export function GTRSidebar({ active, subActive }) {
  const [open, setOpen] = React.useState(() => {
    const stored = loadSidebarState();
    return stored ?? {
      firstPrototype: active === "first-prototype",
      secondPrototype: active === "second-prototype",
    };
  });

  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setOpen((prev) => ({
      firstPrototype: active === "first-prototype" || prev.firstPrototype,
      secondPrototype: active === "second-prototype" || prev.secondPrototype,
    }));
  }, [active]);

  React.useEffect(() => {
    saveSidebarState(open);
  }, [open]);

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className="chapter-rail" aria-label="GTR archive">
      <nav>
        <p>Index</p>
        <a className={active === "intro" ? "active" : ""} href="/gtr/">
          <span>0</span><b>Overview</b><i>→</i>
        </a>

        <button
          type="button"
          className={`rail-toggle ${active === "first-prototype" ? "active" : ""} ${open.firstPrototype ? "rail-toggle--open" : ""}`}
          onClick={() => toggle("firstPrototype")}
          aria-expanded={open.firstPrototype}
        >
          <span>1</span><b>First Prototype</b>
          <span className="rail-toggle__chevron" aria-hidden="true">›</span>
        </button>
        {open.firstPrototype && firstPrototypeChildren.map(([id, number, label, path]) => (
          <React.Fragment key={id}>
            <a
              className={`rail-item--depth-1 ${active === "first-prototype" && subActive === id ? "active" : ""}`}
              href={path}
            >
              <span>{number}</span><b>{label}</b><i>→</i>
            </a>
            {id === "fieldwork-report" && (
              <div className="rail-subnav">
                {fieldworkSubnav.map((item) => (
                  <a
                    key={item.id}
                    className={active === "first-prototype" && subActive === item.id ? "active" : ""}
                    href={item.path}
                  >
                    <span>↳</span><b>{item.label}</b><i>↗</i>
                  </a>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}

        <button
          type="button"
          className={`rail-toggle ${active === "second-prototype" ? "active" : ""} ${open.secondPrototype ? "rail-toggle--open" : ""}`}
          onClick={() => toggle("secondPrototype")}
          aria-expanded={open.secondPrototype}
        >
          <span>2</span><b>Second Prototype</b>
          <span className="rail-toggle__chevron" aria-hidden="true">›</span>
        </button>
        {open.secondPrototype && (
          <React.Fragment>
            <a
              className={`rail-item--depth-1 ${active === "second-prototype" && subActive === "stage-2" ? "active" : ""}`}
              href="/gtr/docs/stage-2/"
            >
              <span>2.1</span><b>Stage 2 PRD</b><i>→</i>
            </a>
          </React.Fragment>
        )}
      </nav>
      <div className="rail-status"><i /> GTR archive <span>2026</span></div>
    </aside>
  );
}
