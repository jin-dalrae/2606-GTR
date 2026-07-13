/* Guided walkthrough + prototype 1/2 switcher + P2 mobile/desktop */
(function () {
  const STEPS_P1 = [
    {
      title: "1 · Welcome",
      short: "What this assessment is",
      detail:
        "Prototype 1 is the free onboarding assessment. Six short questions, then a modeled footprint / handprint snapshot — no consultants, no mandatory uploads.",
    },
    {
      title: "2 · Company basics",
      short: "Name, stage, model",
      detail:
        "Enter company name, funding stage, and business model. Stage and archetype set peer benchmarks (SaaS, hardware, food, biotech, etc.).",
    },
    {
      title: "3 · Scale",
      short: "Team size signals",
      detail:
        "Team size scales default activity lines from a 10-FTE reference model. This is impact by time (tCO₂e/yr) and headcount intensity.",
    },
    {
      title: "4 · Activities",
      short: "What you run day to day",
      detail:
        "Pick activities that apply: compute, hardware, travel, vendors, logistics, and avoided-emissions paths. Scope 1 & 2 are included by default.",
    },
    {
      title: "5 · Context",
      short: "Cloud, energy, notes",
      detail:
        "Optional detail sharpens the model and grounds the AI briefing. Stealth founders can skip uploads — structured fields are enough.",
    },
    {
      title: "6 · Instant report",
      short: "Footprint, handprint, next action",
      detail:
        "See hotspots, peer band, cost exposure, and a maturity-aware first action. Replace defaults with metered data later in the dashboard.",
    },
  ];

  const STEPS_P2_MOBILE = [
    {
      title: "1 · Overview",
      short: "Live impact snapshot",
      detail:
        "Mobile Prototype 2 is the founder dashboard in a phone shell. Start on Overview: estimated footprint, handprint potential, and maturity at a glance.",
    },
    {
      title: "2 · Footprint",
      short: "Operational emissions",
      detail:
        "Drill into the operational carbon footprint — hotspots like compute, electricity, and travel scaled to the team.",
    },
    {
      title: "3 · Handprint",
      short: "Avoided emissions",
      detail:
        "Avoided emissions stay separate from the footprint. Claims should stay gated on additionality before any public number.",
    },
    {
      title: "4 · Goals",
      short: "Goal board & maturity",
      detail:
        "Open the Goal Board tab: owned goals, evidence attachments, and the maturity ladder (L0–L5) with a binding first action.",
    },
    {
      title: "5 · Cost & risk",
      short: "Exposure signals",
      detail:
        "Cost-exposure bands translate tonnes into $ scenarios (compliance vs social cost). Use them as planning ranges, not bills.",
    },
  ];

  const STEPS_P2_DESKTOP = [
    {
      title: "1 · Snapshot header",
      short: "Company + share actions",
      detail:
        "Desktop dashboard wireframe: company strip with copy link, download, and LinkedIn share — the operator surface after assessment.",
    },
    {
      title: "2 · Overview",
      short: "Emit, avoid, net, trend",
      detail:
        "Four cards: CO₂ you emit, CO₂ you help avoid, overall impact, and trend — plus a simple maturity ring (Level 1 of 5).",
    },
    {
      title: "3 · Climate goals",
      short: "Progress & milestones",
      detail:
        "Owned goals with progress bars and a milestone track (Past → Now → Next → Target) so founders see the path, not just a number.",
    },
    {
      title: "4 · How to improve",
      short: "Recommendations",
      detail:
        "Opportunity list with add/remove levers (energy supplier, packaging, travel) and rough tonnes/yr impact tags.",
    },
    {
      title: "5 · Why it matters",
      short: "Outlook + footer",
      detail:
        "Right column explains investor/partner trust, a 6-month outlook sketch, and a footer strip with active goals and average progress.",
    },
  ];

  let proto = "p1";
  let device = "desktop";
  let index = 0;

  function steps() {
    if (proto === "p1") return STEPS_P1;
    return device === "desktop" ? STEPS_P2_DESKTOP : STEPS_P2_MOBILE;
  }

  function frameSrc() {
    if (proto === "p1") return "../prototype1/index.html";
    return device === "desktop"
      ? "../prototype2/desktop/index.html"
      : "../prototype2/index.html";
  }

  function fullHref() {
    if (proto === "p1") return "../prototype1/";
    return device === "desktop" ? "../prototype2/desktop/" : "../prototype2/";
  }

  function setFrameIfNeeded(wanted) {
    const frame = document.getElementById("proto-frame");
    if (!frame) return;
    try {
      const cur = new URL(frame.src, window.location.href).pathname;
      const nextPath = new URL(wanted, window.location.href).pathname;
      if (cur !== nextPath) frame.src = wanted;
    } catch {
      frame.src = wanted;
    }
  }

  function render() {
    const list = document.getElementById("proto-steps");
    const title = document.getElementById("proto-detail-title");
    const body = document.getElementById("proto-detail-body");
    const bar = document.getElementById("proto-stage-label");
    const prev = document.getElementById("proto-prev");
    const next = document.getElementById("proto-next");
    const open = document.getElementById("proto-open");
    const tab1 = document.getElementById("tab-p1");
    const tab2 = document.getElementById("tab-p2");
    const deviceRow = document.getElementById("proto-device-row");
    const tabMobile = document.getElementById("tab-device-mobile");
    const tabDesktop = document.getElementById("tab-device-desktop");
    if (!list || !title || !body) return;

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

    let label;
    if (proto === "p1") {
      label = `Prototype 1 · Assessment · Step ${index + 1}/${S.length}`;
    } else {
      const mode = device === "desktop" ? "Desktop" : "Mobile";
      label = `Prototype 2 · Dashboard · ${mode} · Step ${index + 1}/${S.length}`;
    }
    if (bar) bar.textContent = label;
    if (prev) prev.disabled = index === 0;
    if (next) next.textContent = index === S.length - 1 ? "Done" : "Next step";

    setFrameIfNeeded(frameSrc());

    if (open) {
      open.href = fullHref();
      if (proto === "p1") open.textContent = "Open assessment ↗";
      else if (device === "desktop") open.textContent = "Open desktop dashboard ↗";
      else open.textContent = "Open mobile dashboard ↗";
    }

    if (tab1 && tab2) {
      tab1.classList.toggle("active", proto === "p1");
      tab2.classList.toggle("active", proto === "p2");
      tab1.setAttribute("aria-selected", proto === "p1" ? "true" : "false");
      tab2.setAttribute("aria-selected", proto === "p2" ? "true" : "false");
    }

    if (deviceRow) {
      deviceRow.hidden = proto !== "p2";
    }
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
    if (proto === next) return;
    proto = next;
    index = 0;
    if (proto === "p2") device = "desktop";
    const frame = document.getElementById("proto-frame");
    if (frame) frame.src = frameSrc();
    render();
  }

  function setDevice(next) {
    if (device === next || proto !== "p2") return;
    device = next;
    index = 0;
    const frame = document.getElementById("proto-frame");
    if (frame) frame.src = frameSrc();
    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("tab-p1")?.addEventListener("click", () => setProto("p1"));
    document.getElementById("tab-p2")?.addEventListener("click", () => setProto("p2"));
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
      } else if (proto === "p1") {
        setProto("p2");
      } else {
        window.location.href = "../vision/";
      }
    });

    const frame = document.getElementById("proto-frame");
    if (frame) frame.src = "../prototype1/index.html";
    render();
  });
})();
