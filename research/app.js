/* ================================================================
   Research — GTR slide deck
   Simple, editorial, works as a workspace for incoming findings.
   Open this file in any browser to preview. Built with React UMD.
   ================================================================ */

const h = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;
const useCallback = React.useCallback;
const useRef = React.useRef;

/* ------------------------------------------------------------
   Slide content
   Each entry is one slide. The renderers (below) take the
   slide object and produce React elements.

   To add a slide: append a new object to SLIDES. The id must
   be unique. type must be one of: title | lead | list | quote |
   two-col | figure | closing.

   To replace content with real research: edit the existing
   objects in place — keep the structure intact.
   ------------------------------------------------------------ */

const SLIDES = [
  {
    id: "title",
    type: "title",
    eyebrow: "GTR · Research",
    title: "Why climate measurement is a startup decision.",
    titleEm: " Notes from regulation, market, and product.",
    meta: [
      ["Volume", "01"],
      ["Status", "Working draft"],
      ["Stewards", "GTR team"],
    ],
  },

  {
    id: "reading-guide",
    type: "lead",
    eyebrow: "Reading guide",
    title: "Start with the lock-in. End with the indices.",
    lead:
      "Why an early-stage startup measures climate impact from day one. What regulators and enterprise buyers will eventually demand. What the free calculator market already covers. What this platform layers on top of the existing standards.",
    chips: ["regulation", "market", "platform"],
  },

  {
    id: "lock-in",
    type: "list",
    eyebrow: "Section 1 · Why early",
    title: "Three reasons early-stage measurement matters.",
    items: [
      {
        label: "Structural technology lock-in.",
        body:
          "Cloud region choice sets the lifetime emission profile of a SaaS product. Building on a green grid (Oregon, Ohio, Ireland) costs nothing at Seed. Migrating after Series B costs hundreds of engineering hours.",
      },
      {
        label: "Upstream Scope 3 \u201Cprocurement wall.\u201D",
        body:
          "Banks, health systems, and Fortune 500 buyers are legally bound to cut Scope 3 (CSRD, California SB 253). They treat vendors as carbon liabilities; a heavy-architected startup fails their procurement review at any price.",
      },
      {
        label: "Decoupling carbon from capital.",
        body:
          "If emissions double with revenue, the company carries high transition risk and looks expensive under rising carbon prices. Optimizing growth variables early is what makes the footprint fall as revenue rises \u2014 a safer asset for institutional capital.",
      },
    ],
    listStyle: "num",
  },

  {
    id: "obligations",
    type: "list",
    eyebrow: "Section 2 · Regulation",
    title: "Three tiers of climate obligation.",
    items: [
      {
        label: "Mandatory regardless of company size.",
        body:
          "If operations cross environmental thresholds, monitoring is required at any scale: RCRA above 220 lbs hazardous waste / month, NPDES for process-water discharge, criteria air pollutants (NO\u2093, SO\u2093, VOCs, PM) from listed equipment.",
      },
      {
        label: "Big-company mandatory thresholds.",
        body:
          "Triggered by revenue or emissions rather than being \u201Cbig.\u201D EPA GHGRP at \u226525,000 t CO\u2082e / year (Scope 1). California SB 253 at $1B global revenue (Scope 1+2 by Nov 10, 2026; Scope 3 by 2027). California SB 261 at $500M for climate-related risk disclosure. EPA TRI at 10+ FTE handling threshold toxic chemicals.",
      },
      {
        label: "Voluntary, but procurement-driven.",
        body:
          "Scope 3 outside SB 253, waste diversion rate, water intensity and water-stress mapping, renewable energy percentage. None are federally mandated, yet Walmart / Target supplier rules and ESG-mandate funds make them effectively required for B2B sales.",
      },
    ],
    listStyle: "num",
  },

  {
    id: "playbook",
    type: "list",
    eyebrow: "Section 3 · Playbook",
    title: "What early-stage startups actually need to track.",
    items: [
      {
        label: "Operational bare minimum (B2B readiness).",
        body:
          "A defensible Scope 1 + 2 estimate (often near-zero for office-only SaaS) and a Scope 3 Category 1 number for the cloud region running production. Enterprise sustainability questionnaires ask for both before contract signature.",
      },
      {
        label: "VC and investor metrics.",
        body:
          "Energy intensity (kWh per FTE or per dollar of revenue) signals whether the model scales efficiently. A written e-waste disposal policy removes a routine due-diligence red flag.",
      },
      {
        label: "Hardware, biotech, and physical-product exceptions.",
        body:
          "Hazardous-materials and bio-waste tracking start at lab day one. Supply-chain transparency against RoHS / REACH is roughly ten times cheaper to design correctly at Seed than to retrofit at Series B.",
      },
    ],
    listStyle: "num",
  },

  {
    id: "calculator-market",
    type: "list",
    eyebrow: "Section 4 · Market",
    title: "The free carbon-calculator landscape.",
    items: [
      {
        label: "Freemium lead generators.",
        body:
          "Plan A, Seedling, Sustain.Life, Normative (via SME Climate Hub). Polished UI, fast estimates, Scope 1 + 2 only \u2014 Scope 3 and audit-ready exports sit behind a paywall.",
      },
      {
        label: "Institutional baseline tools.",
        body:
          "EPA Simplified GHG Emissions Calculator (clunky Excel, eGrid factors) and the CoolClimate Network (UC Berkeley, U.S.-localized). No design, but globally accepted by compliance auditors.",
      },
      {
        label: "Built-in cloud consoles.",
        body:
          "AWS Customer Carbon Footprint Tool, Google Cloud Carbon Footprint, Microsoft Sustainability Manager. Free with the account, automatic, and accurate for cloud workloads \u2014 and silent about office, travel, and procurement.",
      },
    ],
    listStyle: "marker",
  },

  {
    id: "spend-vs-activity",
    type: "quote",
    eyebrow: "Section 4 · Verdict",
    quote:
      "Older calculators multiplied dollars by an inflation factor. Activity-based tools \u2014 passenger-miles, kilowatt-hours, kilograms \u2014 produce a baseline that actually shifts when the underlying behavior shifts.",
    attr: { name: "Spend \u2192 Activity", role: "The shift the calculator market made" },
  },

  {
    id: "what-we-model",
    type: "list",
    eyebrow: "Section 5 · Platform",
    title: "What this platform models.",
    items: [
      {
        label: "Growth-Coupled Emissions Projector.",
        body:
          "Forecasts MTCO\u2082e over a 3\u20135-year runway from headcount growth, cloud spend, and office expansion. Isolates whether emissions scale with revenue, faster, or slower.",
      },
      {
        label: "Cloud Architecture & Grid-Decarbonization Modeler.",
        body:
          "Combines projected compute and storage with regional grid emission-factor trajectories (IEA scenarios). Toggle Virginia \u2192 Oregon and see the structural reduction in forward emissions.",
      },
      {
        label: "Transition Risk / Stranding Year Tracker.",
        body:
          "Calculates the calendar year your carbon intensity crosses international procurement or compliance thresholds. Converts a vague sustainability goal into a specific operational deadline.",
      },
    ],
    listStyle: "num",
  },

  {
    id: "indices",
    type: "list",
    eyebrow: "Section 5 · Standards",
    title: "Standards this platform builds on.",
    items: [
      {
        label: "SBTi Corporate Net-Zero Standard.",
        body:
          "Overlays a 1.5\u00B0C-aligned reduction pathway on the growth projection. Sets a precise maximum emissions ceiling for every year of the runway.",
      },
      {
        label: "IEA World Energy Outlook scenarios.",
        body:
          "Stated Policies and Net Zero by 2050 feed forward grid factors. Scope 2 and Scope 3 cloud emissions auto-decarbonize over time rather than using frozen today-era factors.",
      },
      {
        label: "CRREM Stranding Risk methodology.",
        body:
          "Defines the calendar year a model crosses compliance thresholds (kg CO\u2082e / m\u00B2 or / unit revenue). Powers the count-down clock in the Transition Risk Tracker.",
      },
    ],
    listStyle: "num",
  },

  {
    id: "closing",
    type: "closing",
    eyebrow: "End of volume 01",
    title: "Provisional, by design.",
    next: "Treat every slide here as a working draft until the next round of fieldwork.",
  },
];

/* ------------------------------------------------------------
   Slide renderers
   One per slide type. Keep them visually quiet — generous
    whitespace, restrained type, no decorative chrome.
    ------------------------------------------------------------ */

function TitleSlide({ slide }) {
  return h(
    "div",
    { className: "slide title-slide" },
    h("p", { className: "slide-eyebrow" }, slide.eyebrow),
    h(
      "h1",
      { className: "slide-title display" },
      slide.title,
      slide.titleEm
        ? h("em", null, slide.titleEm)
        : null
    ),
    slide.meta && slide.meta.length
      ? h(
          "dl",
          { className: "title-meta" },
          slide.meta.map(([k, v]) =>
            h(React.Fragment, { key: k }, h("dt", null, k), h("dd", null, v))
          )
        )
      : null
  );
}

function LeadSlide({ slide }) {
  return h(
    "div",
    { className: "slide" },
    h("p", { className: "slide-eyebrow" }, slide.eyebrow),
    h("h2", { className: "slide-title" }, slide.title),
    h("p", { className: "slide-lead" }, slide.lead),
    slide.chips && slide.chips.length
      ? h(
          "div",
          { className: "slide-chips" },
          slide.chips.map((c) => h("span", { key: c, className: "slide-chip" }, c))
        )
      : null
  );
}

function ListSlide({ slide }) {
  const style = slide.listStyle || "marker";
  return h(
    "div",
    { className: "slide" },
    h("p", { className: "slide-eyebrow" }, slide.eyebrow),
    h("h2", { className: "slide-title" }, slide.title),
    h(
      "ul",
      { className: "slide-list" },
      slide.items.map((it, i) =>
        h(
          "li",
          { key: i },
          h(
            "span",
            { className: style === "num" ? "marker-num" : "marker" },
            style === "num" ? String(i + 1).padStart(2, "0") : "\u2014"
          ),
          h("span", null, h("strong", null, it.label + ". "), it.body)
        )
      )
    )
  );
}

function QuoteSlide({ slide }) {
  return h(
    "div",
    { className: "slide" },
    h("p", { className: "slide-eyebrow" }, slide.eyebrow),
    h("blockquote", { className: "slide-quote" }, slide.quote),
    slide.attr
      ? h(
          "p",
          { className: "slide-attr" },
          h("strong", null, slide.attr.name),
          slide.attr.role ? "  \u00b7  " + slide.attr.role : ""
        )
      : null
  );
}

function TwoColSlide({ slide }) {
  return h(
    "div",
    { className: "slide" },
    h("p", { className: "slide-eyebrow" }, slide.eyebrow),
    h("h2", { className: "slide-title" }, slide.title),
    h(
      "div",
      { className: "slide-two-col" },
      h(
        "div",
        null,
        h("p", { className: "col-label" }, slide.left.label),
        h("h3", null, slide.left.heading),
        ...(Array.isArray(slide.left.body)
          ? slide.left.body.map((p, i) => h("p", { key: i }, p))
          : [h("p", null, slide.left.body)])
      ),
      h(
        "div",
        null,
        h("p", { className: "col-label" }, slide.right.label),
        h("h3", null, slide.right.heading),
        ...(Array.isArray(slide.right.body)
          ? slide.right.body.map((p, i) => h("p", { key: i }, p))
          : [h("p", null, slide.right.body)])
      )
    )
  );
}

function FigureSlide({ slide }) {
  const figureChildren =
    slide.figure && slide.figure.kind === "img" && slide.figure.src
      ? h("img", {
          src: slide.figure.src,
          alt: slide.figure.alt || "",
          loading: "lazy",
        })
      : h(
          "div",
          { className: "figure-frame" },
          (slide.figure && slide.figure.label) || "figure"
        );

  return h(
    "div",
    { className: "slide" },
    h("p", { className: "slide-eyebrow" }, slide.eyebrow),
    h("h2", { className: "slide-title" }, slide.title),
    h(
      "figure",
      { className: "slide-figure" },
      figureChildren,
      slide.caption
        ? h(
            "figcaption",
            null,
            slide.caption.lead
              ? h("strong", null, slide.caption.lead + " ")
              : null,
            slide.caption.body || ""
          )
        : null
    )
  );
}

function ClosingSlide({ slide }) {
  return h(
    "div",
    { className: "slide closing" },
    h("p", { className: "slide-eyebrow" }, slide.eyebrow),
    h("h2", { className: "slide-title display" }, slide.title),
    slide.next
      ? h("p", { className: "next" }, slide.next)
      : null
  );
}

const SLIDE_RENDERERS = {
  title: TitleSlide,
  lead: LeadSlide,
  list: ListSlide,
  quote: QuoteSlide,
  "two-col": TwoColSlide,
  figure: FigureSlide,
  closing: ClosingSlide,
};

function SlideStage({ slide }) {
  const Renderer = SLIDE_RENDERERS[slide.type] || LeadSlide;
  return h(Renderer, { slide });
}

/* ------------------------------------------------------------
   Slide nav — counter, dots, arrows. Keyboard + click.
   ------------------------------------------------------------ */

function SlideDots({ total, index, onJump }) {
  return h(
    "div",
    { className: "nav-dots", role: "tablist", "aria-label": "Jump to slide" },
    Array.from({ length: total }, (_, i) =>
      h("button", {
        key: i,
        className: "nav-dot" + (i === index ? " is-active" : ""),
        "aria-label": "Go to slide " + (i + 1),
        "aria-selected": i === index,
        onClick: () => onJump(i),
      })
    )
  );
}

function SlideNav({ index, total, onPrev, onNext, onJump }) {
  const counter = (
    h(
      "span",
      { className: "nav-counter" },
      h("span", { className: "current" }, String(index + 1)),
      h("span", null, " / " + String(total))
    )
  );

  return h(
    "nav",
    { className: "deck-nav", "aria-label": "Slide navigation" },
    h(
      "button",
      {
        className: "nav-arrow",
        onClick: onPrev,
        disabled: index === 0,
        "aria-label": "Previous slide",
      },
      "\u2190"
    ),
    h(
      "div",
      { className: "nav-center" },
      counter,
      h(SlideDots, { total, index, onJump })
    ),
    h(
      "button",
      {
        className: "nav-arrow",
        onClick: onNext,
        disabled: index === total - 1,
        "aria-label": "Next slide",
      },
      "\u2192"
    )
  );
}

/* ------------------------------------------------------------
   Overview grid — toggle with G or overview button
   ------------------------------------------------------------ */

function DeckOverview({ slides, currentIndex, onJump, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "g" || e.key === "G") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return h(
    "div",
    { className: "deck-overview", role: "dialog", "aria-label": "Slide overview" },
    h(
      "div",
      { className: "deck-overview-header" },
      h("h2", null, "Overview"),
      h("button", { className: "close", onClick: onClose }, "Close \u00d7")
    ),
    h(
      "div",
      { className: "deck-overview-grid" },
      slides.map((s, i) => {
        const previewText =
          s.title || s.quote || s.lead || (s.type === "closing" ? "End" : "Slide");
        const isQuote = s.type === "quote";
        return h(
          "button",
          {
            key: s.id,
            className: "overview-card" + (i === currentIndex ? " is-current" : ""),
            onClick: () => onJump(i),
          },
          h("span", { className: "num" }, "Slide " + String(i + 1).padStart(2, "0")),
          h(
            "p",
            { className: "preview" + (isQuote ? " is-quote" : "") },
            previewText
          )
        );
      })
    )
  );
}

/* ------------------------------------------------------------
   Top bar
   ------------------------------------------------------------ */

function TopBar({ onOverview }) {
  return h(
    "header",
    { className: "deck-topbar" },
    h(
      "a",
      { className: "back", href: "/" },
      "\u2190",
      h("span", null, "Back to main")
    ),
    h(
      "div",
      { className: "wordmark" },
      "Research",
      h("em", null, "GTR")
    ),
    h(
      "button",
      { className: "overview-btn", onClick: onOverview, "aria-label": "Open overview" },
      "Overview"
    )
  );
}

/* ------------------------------------------------------------
   Root component
   ------------------------------------------------------------ */

function App() {
  const [index, setIndex] = useState(0);
  const [overview, setOverview] = useState(false);
  const total = SLIDES.length;
  const slide = SLIDES[index];

  const go = useCallback(
    (next) => {
      setIndex((i) => Math.max(0, Math.min(total - 1, next)));
    },
    [total]
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  const toggleOverview = useCallback(() => setOverview((v) => !v), []);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      // Avoid hijacking arrows when typing in an input/textarea
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;

      if (overview) return; // overview handles its own keys

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          go(0);
          break;
        case "End":
          e.preventDefault();
          go(total - 1);
          break;
        case "g":
        case "G":
        case "Escape":
          e.preventDefault();
          toggleOverview();
          break;
        default:
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, total, overview, toggleOverview]);

  // Touch swipe
  const touch = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onStart = (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      touch.current = { x: t.clientX, y: t.clientY };
    };
    const onEnd = (e) => {
      if (overview) return;
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - touch.current.x;
      const dy = t.clientY - touch.current.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) next();
        else prev();
      }
    };
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, [next, prev, overview]);

  // Sync window title with current slide
  useEffect(() => {
    const title = (slide && (slide.title || slide.eyebrow)) || "Research";
    document.title = title + " \u00b7 Research \u00b7 GTR";
  }, [slide]);

  return h(
    React.Fragment,
    null,
    h(
      "div",
      { className: "deck" },
      h(TopBar, { onOverview: toggleOverview }),
      h("main", { className: "deck-stage", role: "main" }, h(SlideStage, { slide })),
      h(SlideNav, {
        index,
        total,
        onPrev: prev,
        onNext: next,
        onJump: go,
      })
    ),
    overview
      ? h(DeckOverview, {
          slides: SLIDES,
          currentIndex: index,
          onJump: (i) => {
            go(i);
            setOverview(false);
          },
          onClose: () => setOverview(false),
        })
      : null
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(h(App));
