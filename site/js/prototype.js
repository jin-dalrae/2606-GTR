/* Midterm prototype shell — multi-role set
   1 Assessment · 2 Dashboard · 3 Investor · 4 Program · 5 Leaderboard */
(function () {
  const PROTOS = {
    p1: {
      id: "p1",
      label: "1 · Assessment",
      stageLabel: "Prototype 1 · Assessment",
      openLabel: "Open assessment ↗",
      src: "../prototype1/index.html",
      full: "../prototype1/",
      device: false,
      steps: [
        {
          title: "1 · Welcome",
          short: "What this assessment is",
          detail:
            "Free onboarding for founders: six short questions, then a modeled footprint / handprint snapshot — no consultants, no mandatory uploads.",
        },
        {
          title: "2 · Company basics",
          short: "Name, stage, model",
          detail:
            "Company name, funding stage, and business model set peer benchmarks (SaaS, hardware, food, biotech, etc.).",
        },
        {
          title: "3 · Scale",
          short: "Team size signals",
          detail:
            "Team size scales default activity lines. This is impact by time (tCO₂e/yr) and headcount intensity.",
        },
        {
          title: "4 · Activities",
          short: "Day-to-day operations",
          detail:
            "Pick activities: compute, hardware, travel, vendors, logistics, and avoided-emissions paths. Scope 1 & 2 included by default.",
        },
        {
          title: "5 · Context",
          short: "Cloud, energy, notes",
          detail:
            "Optional detail sharpens the model. Stealth founders can skip uploads — structured fields are enough.",
        },
        {
          title: "6 · Instant report",
          short: "Footprint, handprint, next action",
          detail:
            "Hotspots, peer band, cost exposure, and a maturity-aware first action. Metered data lands later in the founder dashboard.",
        },
      ],
    },
    p2: {
      id: "p2",
      label: "2 · Dashboard",
      stageLabel: "Prototype 2 · Founder dashboard",
      openLabel: "Open dashboard full screen ↗",
      src: "../prototype2/",
      full: "../prototype2/",
      device: false,
      steps: [
        {
          title: "1 · Enter company URL",
          short: "Start from the web",
          detail:
            "Interactive founder dashboard mockup: paste a company URL to generate a personalized climate snapshot.",
        },
        {
          title: "2 · Identity strip",
          short: "Logo + company context",
          detail:
            "Dashboard opens with company identity and a clear “your climate footprint” framing.",
        },
        {
          title: "3 · Overview metrics",
          short: "Emit, avoid, maturity",
          detail:
            "See operational footprint, avoided emissions potential, and a simple maturity read.",
        },
        {
          title: "4 · Goals & journey",
          short: "What to improve",
          detail:
            "Climate goals, journey milestones, and a “what’s next” path — an operating surface, not a one-time PDF.",
        },
      ],
    },
    p3: {
      id: "p3",
      label: "3 · Investor",
      stageLabel: "Prototype 3 · Investor portfolio",
      openLabel: "Open investor board ↗",
      src: "../prototype3/index.html",
      full: "../prototype3/",
      device: false,
      steps: [
        {
          title: "1 · Portfolio climate risk",
          short: "Fund-level view",
          detail:
            "Investor board: climate risk and impact across a portfolio — not one company at a time.",
        },
        {
          title: "2 · Compare holdings",
          short: "Intensity & exposure",
          detail:
            "Rank and compare companies on footprint intensity, cost exposure, and confidence — diligence-ready language.",
        },
        {
          title: "3 · Drill into a company",
          short: "Founder-level detail",
          detail:
            "Open a single holding for hotspots, sources, and peer context before the partner meeting.",
        },
        {
          title: "4 · Share & export",
          short: "IC-ready snapshot",
          detail:
            "Export or share a portfolio climate read. Illustrative prototype — not live fund data.",
        },
      ],
    },
    p4: {
      id: "p4",
      label: "4 · Program",
      stageLabel: "Prototype 4 · Program director",
      openLabel: "Open program board ↗",
      src: "../prototype4/index.html",
      full: "../prototype4/",
      device: false,
      steps: [
        {
          title: "1 · Cohort overview",
          short: "Completion & intensity",
          detail:
            "Program / incubator director view: how many founders finished the assessment, average intensity, and confidence mix for the current cohort.",
        },
        {
          title: "2 · Founder roster",
          short: "Completed vs pending",
          detail:
            "Filter the roster, nudge pending founders, and open a company detail when the assessment is done.",
        },
        {
          title: "3 · Compare cohorts",
          short: "Year over year",
          detail:
            "Stack this cohort against prior ones on completion rate, intensity, and confidence tier mix.",
        },
        {
          title: "4 · Export for partners",
          short: "Program reporting",
          detail:
            "Download a cohort climate snapshot for LPs, grant reports, or internal reviews. Prototype data only.",
        },
      ],
    },
    p5: {
      id: "p5",
      label: "5 · Leaderboard",
      stageLabel: "Prototype 5 · Leaderboard",
      openLabel: "Open leaderboard ↗",
      src: "../leaderboard/",
      full: "../leaderboard/",
      device: false,
      steps: [
        {
          title: "1 · Pick a cohort",
          short: "Stage, size, revenue",
          detail:
            "Filter by funding stage, team size, and revenue band so Seed companies are not ranked against Series B giants.",
        },
        {
          title: "2 · Sort the board",
          short: "EI/Revenue and more",
          detail:
            "Default rank is best (lowest) EI per $1M ARR. Also sort by improving intensity, maturity, revenue, or team size.",
        },
        {
          title: "3 · Read intensity",
          short: "Footprint vs handprint",
          detail:
            "Each row shows EI/$1M, absolute footprint, handprint, maturity level, and YoY intensity trend — illustrative portfolio data.",
        },
        {
          title: "4 · Cohort summary",
          short: "Medians and leaders",
          detail:
            "Cards below the table show cohort median team, average intensity, and the intensity leader for the filters in view.",
        },
      ],
    },
  };

  const ORDER = ["p1", "p2", "p3", "p4", "p5"];

  let proto = "p1";
  let device = "desktop"; // for p2: desktop = interactive mockup, mobile = phone shell
  let index = 0;

  function cfg() {
    return PROTOS[proto];
  }

  function steps() {
    const c = cfg();
    if (c.device && device === "mobile" && c.stepsMobile) return c.stepsMobile;
    return c.steps;
  }

  /** Resolve site root e.g. "/midterm/" so iframe srcs work with cleanUrls + embeds */
  function siteRoot() {
    const parts = window.location.pathname.replace(/\/index\.html$/, "/").split("/").filter(Boolean);
    const i = parts.indexOf("midterm");
    if (i >= 0) return "/" + parts.slice(0, i + 1).join("/") + "/";
    // local file or preview without /midterm
    return new URL("../", window.location.href).pathname.endsWith("/")
      ? new URL("../", window.location.href).pathname
      : new URL("../", window.location.href).pathname + "/";
  }

  function abs(rel) {
    // rel like "../prototype2/index.html" or "../prototype2/"
    const name = rel
      .replace(/^\.\.\//, "")
      .replace(/index\.html$/, "")
      .replace(/\/$/, "");
    return siteRoot() + name + "/";
  }

  function frameSrc() {
    const c = cfg();
    if (c.device && device === "mobile") return abs(c.srcMobile || c.fullMobile);
    return abs(c.src || c.full);
  }

  function fullHref() {
    return frameSrc();
  }

  function setFrame(wanted) {
    const frame = document.getElementById("proto-frame");
    if (!frame) return;
    const next = wanted || frameSrc();
    // Always assign — path compare breaks under Firebase cleanUrls/trailingSlash
    if (frame.getAttribute("data-src") !== next) {
      frame.setAttribute("data-src", next);
      frame.src = next;
    }
  }

  function renderTabs() {
    const mount = document.getElementById("proto-tabs");
    if (!mount) return;
    mount.innerHTML = ORDER.map((id) => {
      const c = PROTOS[id];
      const active = id === proto ? "active" : "";
      return `<button type="button" role="tab" data-proto="${id}" class="${active}" aria-selected="${
        id === proto ? "true" : "false"
      }">${c.label}</button>`;
    }).join("");
    mount.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => setProto(btn.dataset.proto));
    });
  }

  function render() {
    const list = document.getElementById("proto-steps");
    const title = document.getElementById("proto-detail-title");
    const body = document.getElementById("proto-detail-body");
    const bar = document.getElementById("proto-stage-label");
    const prev = document.getElementById("proto-prev");
    const next = document.getElementById("proto-next");
    const open = document.getElementById("proto-open");
    const deviceRow = document.getElementById("proto-device-row");
    const tabMobile = document.getElementById("tab-device-mobile");
    const tabDesktop = document.getElementById("tab-device-desktop");
    if (!list || !title || !body) return;

    renderTabs();

    const S = steps();
    if (index >= S.length) index = S.length - 1;
    if (index < 0) index = 0;

    list.innerHTML = S.map(
      (s, i) => `
      <li>
        <button type="button" data-i="${i}" class="${i === index ? "active" : ""}">
          <span class="step-title">${s.title}</span>
          <span class="step-desc">${s.short}</span>
        </button>
      </li>`
    ).join("");

    const step = S[index];
    title.textContent = step.title;
    body.textContent = step.detail;

    const c = cfg();
    let label = `${c.stageLabel} · Step ${index + 1}/${S.length}`;
    if (c.device) {
      label = `${c.stageLabel} · ${device === "mobile" ? "Mobile" : "Desktop"} · Step ${
        index + 1
      }/${S.length}`;
    }
    if (bar) bar.textContent = label;
    if (prev) prev.disabled = index === 0;
    if (next) {
      const last = index === S.length - 1;
      const lastProto = proto === ORDER[ORDER.length - 1];
      next.textContent = last ? (lastProto ? "Done" : "Next prototype") : "Next step";
    }

    setFrame();

    if (open) {
      open.href = fullHref();
      open.textContent = c.openLabel;
      if (c.device && device === "mobile") open.textContent = "Open mobile dashboard ↗";
    }

    if (deviceRow) deviceRow.hidden = !c.device;
    if (tabMobile && tabDesktop) {
      tabMobile.classList.toggle("active", device === "mobile");
      tabDesktop.classList.toggle("active", device === "desktop");
      tabMobile.setAttribute("aria-selected", device === "mobile" ? "true" : "false");
      tabDesktop.setAttribute("aria-selected", device === "desktop" ? "true" : "false");
    }

    list.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        index = Number(btn.dataset.i);
        render();
      });
    });
  }

  function setProto(next) {
    if (!PROTOS[next] || proto === next) return;
    proto = next;
    index = 0;
    if (PROTOS[next].device) device = "desktop";
    const frame = document.getElementById("proto-frame");
    setFrame();
    render();
  }

  function setDevice(next) {
    if (!cfg().device || device === next) return;
    device = next;
    index = 0;
    const frame = document.getElementById("proto-frame");
    setFrame();
    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && PROTOS[tab]) proto = tab;
    const dev = params.get("device");
    if (dev === "mobile" || dev === "desktop") device = dev;

    document.getElementById("tab-device-mobile")?.addEventListener("click", () => setDevice("mobile"));
    document.getElementById("tab-device-desktop")?.addEventListener("click", () => setDevice("desktop"));
    document.getElementById("proto-prev")?.addEventListener("click", () => {
      index = Math.max(0, index - 1);
      render();
    });
    document.getElementById("proto-next")?.addEventListener("click", () => {
      const S = steps();
      if (index < S.length - 1) {
        index += 1;
        render();
        return;
      }
      const i = ORDER.indexOf(proto);
      if (i < ORDER.length - 1) setProto(ORDER[i + 1]);
      else window.location.href = "../vision/";
    });

    setFrame();
    render();
  });
})();
