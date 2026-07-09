/* Guided walkthrough + prototype 1/2 switcher */
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

  const STEPS_P2 = [
    {
      title: "1 · Overview",
      short: "Live impact snapshot",
      detail:
        "Prototype 2 is the founder dashboard. Start on Overview: estimated footprint, handprint potential, and maturity at a glance.",
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

  let proto = "p1";
  let index = 0;

  function steps() {
    return proto === "p1" ? STEPS_P1 : STEPS_P2;
  }

  function frameSrc() {
    return proto === "p1" ? "../prototype1/index.html" : "../prototype2/index.html";
  }

  function fullHref() {
    return proto === "p1" ? "../prototype1/" : "../prototype2/";
  }

  function render() {
    const list = document.getElementById("proto-steps");
    const title = document.getElementById("proto-detail-title");
    const body = document.getElementById("proto-detail-body");
    const bar = document.getElementById("proto-stage-label");
    const prev = document.getElementById("proto-prev");
    const next = document.getElementById("proto-next");
    const frame = document.getElementById("proto-frame");
    const open = document.getElementById("proto-open");
    const tab1 = document.getElementById("tab-p1");
    const tab2 = document.getElementById("tab-p2");
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

    const label =
      proto === "p1"
        ? `Prototype 1 · Assessment · Step ${index + 1}/${S.length}`
        : `Prototype 2 · Dashboard · Step ${index + 1}/${S.length}`;
    if (bar) bar.textContent = label;
    if (prev) prev.disabled = index === 0;
    if (next) next.textContent = index === S.length - 1 ? "Done" : "Next step";

    if (frame) {
      const wanted = frameSrc();
      // Only reload when switching prototypes — keep in-progress assessment state
      const absWanted = new URL(wanted, window.location.href).href;
      if (frame.src !== absWanted && !frame.src.endsWith(wanted.replace("../", "/"))) {
        // Compare path ends
        try {
          const cur = new URL(frame.src).pathname;
          const nextPath = new URL(wanted, window.location.href).pathname;
          if (cur !== nextPath) frame.src = wanted;
        } catch {
          frame.src = wanted;
        }
      }
    }
    if (open) {
      open.href = fullHref();
      open.textContent = proto === "p1" ? "Open assessment ↗" : "Open dashboard ↗";
    }

    if (tab1 && tab2) {
      tab1.classList.toggle("active", proto === "p1");
      tab2.classList.toggle("active", proto === "p2");
      tab1.setAttribute("aria-selected", proto === "p1" ? "true" : "false");
      tab2.setAttribute("aria-selected", proto === "p2" ? "true" : "false");
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
    const frame = document.getElementById("proto-frame");
    if (frame) frame.src = frameSrc();
    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("tab-p1")?.addEventListener("click", () => setProto("p1"));
    document.getElementById("tab-p2")?.addEventListener("click", () => setProto("p2"));
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

    // Force initial load of prototype1 with absolute path for reliability
    const frame = document.getElementById("proto-frame");
    if (frame) frame.src = "../prototype1/index.html";
    render();
  });
})();
