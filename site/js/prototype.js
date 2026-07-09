/* Guided walkthrough for Prototype 1 */
(function () {
  const STEPS = [
    {
      id: "welcome",
      title: "1 · Welcome",
      short: "What this assessment is for",
      detail:
        "Prototype 1 is the free onboarding assessment. It is built for Seed–Series B founders — any industry — who need a directional climate snapshot without consultants or spreadsheets. Data stays private by default.",
    },
    {
      id: "company",
      title: "2 · Company basics",
      short: "Name, stage, business model",
      detail:
        "Enter company name, funding stage, and business model. The model uses stage and archetype to set peer benchmarks (SaaS, hardware, food, biotech, and more) — not to invent a proprietary score.",
    },
    {
      id: "scale",
      title: "3 · Scale signals",
      short: "Team size & growth signals",
      detail:
        "Team size scales default activity lines from a 10-FTE reference model. This is impact by time (tCO₂e/yr) and headcount intensity — the foundation for later revenue-normalized ratios on the investor board.",
    },
    {
      id: "activities",
      title: "4 · Activities",
      short: "What you run day to day",
      detail:
        "Pick activities that apply: cloud/AI compute, hardware, travel, vendors, logistics, and avoided-emissions paths. Scope 1 & 2 electricity/direct lines are included by default. Every line cites a factor source.",
    },
    {
      id: "context",
      title: "5 · Context",
      short: "Cloud, energy, notes",
      detail:
        "Optional detail — cloud provider, region, energy mix, website — sharpens the model and grounds the AI briefing. Stealth founders can skip uploads; structured fields are enough for a first snapshot.",
    },
    {
      id: "report",
      title: "6 · Instant report",
      short: "Footprint, handprint, next action",
      detail:
        "You get modeled footprint hotspots, handprint potential (additionality-gated), peer band, cost exposure, impact beyond carbon, and a maturity-aware first action. Replace defaults with metered data later in the dashboard.",
    },
  ];

  let index = 0;

  function render() {
    const list = document.getElementById("proto-steps");
    const title = document.getElementById("proto-detail-title");
    const body = document.getElementById("proto-detail-body");
    const bar = document.getElementById("proto-stage-label");
    const prev = document.getElementById("proto-prev");
    const next = document.getElementById("proto-next");
    if (!list || !title || !body) return;

    list.innerHTML = STEPS.map(
      (s, i) => `
      <li>
        <button type="button" data-i="${i}" class="${i === index ? "active" : ""}" aria-current="${i === index ? "step" : "false"}">
          <span class="step-title">${s.title}</span>
          <span class="step-desc">${s.short}</span>
        </button>
      </li>`
    ).join("");

    const step = STEPS[index];
    title.textContent = step.title;
    body.textContent = step.detail;
    if (bar) bar.textContent = `Step ${index + 1} of ${STEPS.length} · ${step.short}`;
    if (prev) prev.disabled = index === 0;
    if (next) next.textContent = index === STEPS.length - 1 ? "Finish" : "Next step";

    list.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        index = Number(btn.dataset.i);
        render();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const prev = document.getElementById("proto-prev");
    const next = document.getElementById("proto-next");
    if (prev) {
      prev.addEventListener("click", () => {
        index = Math.max(0, index - 1);
        render();
      });
    }
    if (next) {
      next.addEventListener("click", () => {
        if (index < STEPS.length - 1) {
          index += 1;
          render();
        } else {
          window.location.href = "../vision/";
        }
      });
    }
    render();
  });
})();
