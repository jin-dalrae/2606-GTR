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
  { type: "doc-divider", title: "business environmental impact metrics" },
  {
    type: "doc",
    body: [
      { type: "p", text: "Once a startup scales its infrastructure, locks in suppliers, and establishes its core architecture, changing those foundations becomes incredibly difficult and expensive. Managing future impact from day one is critical for three unromanticized, practical reasons:" },
    ],
  },
  {
    type: "doc",
    title: "1. Structural Technology Lock-In",
    body: [
      { type: "p", text: "For early-stage tech and SaaS startups, the single largest environmental decision they make is where and how they host their cloud code." },
      { type: "kv", label: "The Reality", text: "If a software startup builds its server architecture in a high-carbon-intensity power grid region (like the AWS Virginia data centers), that emission profile scales linearly with their user growth." },
      { type: "kv", label: "Why Early Stage Matters", text: "If they use a future-impact dashboard at the seed stage, they can choose a green grid region (like Oregon, Ohio, or Ireland) before writing millions of lines of code. Moving data centers after reaching Series B is a logistical nightmare that costs significant engineering hours." },
    ],
  },
  {
    type: "doc",
    title: '2. The Upstream Scope 3 "Procurement Wall"',
    body: [
      { type: "p", text: "Large enterprise buyers (banks, healthcare systems, Fortune 500s) are bound by strict climate transparency regulations (like California's SB 253 or Europe's CSRD) and the Science Based Targets initiative (SBTi) Version 2.0 corporate standards." },
      { type: "kv", label: "The Reality", text: "These giant buyers are legally required to reduce their Scope 3 emissions. This means they look at their vendors (startups) as carbon liabilities." },
      { type: "kv", label: "Why Early Stage Matters", text: "If a startup waits until they are ready to sell to a corporate buyer to check their impact, they risk realizing their product architecture is too carbon-heavy to clear the buyer's procurement thresholds. Designing for low carbon intensity early keeps their future sales pipeline open." },
    ],
  },
  {
    type: "doc",
    title: "3. Decoupling Carbon from Capital (The VC Risk)",
    body: [
      { type: "p", text: "Institutional investors track how cleanly a company scales. If a startup's emissions double every time its revenue doubles, it carries a high transition risk." },
      { type: "kv", label: "The Reality", text: "As carbon taxes and regulatory penalties increase globally, a carbon-heavy operational model becomes an expensive liability." },
      { type: "kv", label: "Why Early Stage Matters", text: "Estimating impact early allows founders to optimize their growth variables, ensuring that as their business model grows, their carbon footprint scales down. This makes them a much safer, highly attractive asset for institutional VCs down the line." },
    ],
  },

  { type: "doc-divider", title: "how business is regulated" },
  {
    type: "doc",
    body: [
      { type: "p", text: "At the federal level, the regulatory environment has shifted heavily. The SEC formally proposed the total rescission of its federal climate disclosure rule, meaning there is no sweeping federal mandate for carbon reporting. However, state-level laws and environmental baselines remain strictly enforced." },
    ],
  },
  {
    type: "doc",
    title: "1. Mandatory for All Companies",
    body: [
      { type: "p", text: "Regardless of your company's revenue, if your physical operations cross certain environmental thresholds or deal with regulated materials, you must monitor and report these metrics to the EPA or state equivalents." },
      { type: "kv", label: "Hazardous Waste Quantities", text: "Mandatory under RCRA if you generate more than 220 lbs of hazardous waste per month. You must track generation, storage, and manifest-to-grave disposal." },
      { type: "kv", label: "Wastewater Pollutant Discharges", text: "Mandatory if your facility discharges process water into U.S. waters or public sewers. You must monitor chemical oxygen demand, pH, and specific heavy metals under NPDES permits." },
      { type: "kv", label: "Criteria Air Pollutants", text: "Mandatory if your facility operates equipment (like large boilers or manufacturing lines) that exceeds local air district emission thresholds. (Pollutants: NOₓ, SOₓ, VOCs, Particulate Matter.)" },
    ],
  },
  {
    type: "doc",
    title: '2. Big Company Mandatory (The "Large Entity" Ranges)',
    body: [
      { type: "p", text: 'The U.S. does not have a single, universal definition of a "big company." Instead, different environmental laws use specific revenue or physical emission thresholds to trigger mandatory tracking.' },
      { type: "table", head: ["Regulation / Law", "Threshold Trigger", "Metrics You Must Monitor"], rows: [
        ["EPA Greenhouse Gas Reporting Program (GHGRP)", "Facilities emitting greater than or equal to 25,000 metric tons of CO₂e per year.", "Scope 1 Emissions Only: Direct greenhouse gases from smokestacks, chemical processes, or heavy fleets."],
        ["California SB 253 (Climate Corporate Data Accountability Act)", "Public or private companies doing business in California with over $1 Billion in total annual global revenue.", "Scope 1 & Scope 2 Emissions: Direct emissions and indirect energy use. (Note: The initial Scope 1 and 2 reporting deadline is set for November 10, 2026. Scope 3 reporting begins in 2027.)"],
        ["California SB 261 (Climate-Related Financial Risk Act)", "Public or private companies doing business in California with over $500 Million in total annual global revenue.", 'Climate-Related Financial Risks: Mandatory qualitative disclosures regarding governance and risk management strategies. (Enforcement is temporarily stayed in court, but companies are keeping data "publish-ready".)'],
        ["EPA Toxics Release Inventory (TRI)", "Facilities with 10 or more full-time employees in specific industries (manufacturing, mining, power) that handle threshold quantities of toxic chemicals.", "Toxic Chemical Releases: The exact quantities of specific chemicals managed through recycling, energy recovery, treatment, or environmental release."],
      ] },
    ],
  },
  {
    type: "doc",
    title: "3. Optional / Voluntary Metrics",
    body: [
      { type: "p", text: "These metrics are not required by law, but companies monitor them to satisfy enterprise customers, retail buyers (like Walmart or Target procurement rules), or ESG investors." },
      { type: "kv", label: "Scope 3 Emissions", text: "Value chain emissions (e.g., employee commuting, vendor shipping, product lifecycle). Outside of California's upcoming 2027 mandate for billion-dollar firms, this is entirely optional but widely tracked due to B2B customer pressure." },
      { type: "kv", label: "Waste Diversion Rate / Zero-Waste-to-Landfill", text: "Tracking the percentage of trash sent to recycling or composting vs. municipal landfills." },
      { type: "kv", label: "Water Intensity & Water Stress Mapping", text: "Measuring gallons of water consumed per dollar of revenue, or mapping facility coordinates against regional water-scarcity databases." },
      { type: "kv", label: "Renewable Energy Percentage", text: "Tracking the exact portion of your electricity mix that comes from wind, solar, or green tariffs." },
    ],
  },

  { type: "doc-divider", title: "why startups need to care" },
  {
    type: "doc",
    body: [
      { type: "p", text: "Once a startup scales its infrastructure, locks in suppliers, and establishes its core architecture, changing those foundations becomes incredibly difficult and expensive. Managing future impact from day one is critical for three unromanticized, practical reasons:" },
    ],
  },
  {
    type: "doc",
    title: "1. Structural Technology Lock-In",
    body: [
      { type: "p", text: "For early-stage tech and SaaS startups, the single largest environmental decision they make is where and how they host their cloud code." },
      { type: "kv", label: "The Reality", text: "If a software startup builds its server architecture in a high-carbon-intensity power grid region (like the AWS Virginia data centers), that emission profile scales linearly with their user growth." },
      { type: "kv", label: "Why Early Stage Matters", text: "If they use a future-impact dashboard at the seed stage, they can choose a green grid region (like Oregon, Ohio, or Ireland) before writing millions of lines of code. Moving data centers after reaching Series B is a logistical nightmare that costs significant engineering hours." },
    ],
  },
  {
    type: "doc",
    title: '2. The Upstream Scope 3 "Procurement Wall"',
    body: [
      { type: "p", text: "Large enterprise buyers (banks, healthcare systems, Fortune 500s) are bound by strict climate transparency regulations (like California's SB 253 or Europe's CSRD) and the Science Based Targets initiative (SBTi) Version 2.0 corporate standards." },
      { type: "kv", label: "The Reality", text: "These giant buyers are legally required to reduce their Scope 3 emissions. This means they look at their vendors (startups) as carbon liabilities." },
      { type: "kv", label: "Why Early Stage Matters", text: "If a startup waits until they are ready to sell to a corporate buyer to check their impact, they risk realizing their product architecture is too carbon-heavy to clear the buyer's procurement thresholds. Designing for low carbon intensity early keeps their future sales pipeline open." },
    ],
  },
  {
    type: "doc",
    title: "3. Decoupling Carbon from Capital (The VC Risk)",
    body: [
      { type: "p", text: "Institutional investors track how cleanly a company scales. If a startup's emissions double every time its revenue doubles, it carries a high transition risk." },
      { type: "kv", label: "The Reality", text: "As carbon taxes and regulatory penalties increase globally, a carbon-heavy operational model becomes an expensive liability." },
      { type: "kv", label: "Why Early Stage Matters", text: "Estimating impact early allows founders to optimize their growth variables, ensuring that as their business model grows, their carbon footprint scales down. This makes them a much safer, highly attractive asset for institutional VCs down the line." },
    ],
  },

  { type: "doc-divider", title: "what they need to do currently" },
  {
    type: "doc",
    body: [
      { type: "p", text: "For an early-stage startup, your environmental tracking strategy should be lean and strategic. You do not need a multi-million dollar ESG team, but ignoring metrics entirely can kill your chances of winning enterprise B2B customers or raising institutional capital." },
      { type: "p", text: "Unless you are a deep-tech, hardware, or biotech startup handling physical chemicals (which triggers immediate hazardous waste and local air permits), your focus should be on commercial readiness and investor expectations." },
      { type: "p", text: "Here is what early-stage startups actually need to check." },
    ],
  },
  {
    type: "doc",
    title: "1. The Operational Bare Minimum (B2B Commercial Readiness)",
    body: [
      { type: "p", text: "If your startup sells software, services, or light physical goods to large enterprise clients (Fortune 500, banks, healthcare), their procurement teams will send you a vendor sustainability questionnaire before signing a contract." },
      { type: "kv", label: "Your Corporate Carbon Footprint (Scope 1 & 2)", text: "You need a defensible estimate of your direct emissions (usually zero if you don't own factories or delivery trucks) and your indirect emissions (the electricity used by your office or co-working space)." },
      { type: "kv", label: "Your Cloud/Data Data Center Impact (Scope 3 - Category 1)", text: 'If you are a SaaS startup, your largest environmental impact by far is the electricity consumed by your cloud infrastructure (AWS, Google Cloud, Azure). Enterprise buyers will want to know if your workloads are running in "green" or carbon-neutral data center regions.' },
    ],
  },
  {
    type: "doc",
    title: "2. Venture Capital & Investor Metrics",
    body: [
      { type: "p", text: "Institutional venture capital firms (especially in Europe or US funds with ESG mandates) increasingly ask for basic baseline metrics during due diligence. They look for massive operational risks rather than perfect data." },
      { type: "kv", label: "Energy Intensity", text: "Your total energy use (kWh) divided by your headcount or revenue. It shows investors that your business model can scale efficiently." },
      { type: "kv", label: "Electronic Waste (E-Waste) Policy", text: "A simple tracked inventory of how your startup disposes of its hardware (laptops, monitors, servers) when they reach end-of-life." },
    ],
  },
  {
    type: "doc",
    title: "3. Hardware, Biotech, and Physical Product Startups (The Exceptions)",
    body: [
      { type: "p", text: "If your startup manufactures a physical product, operates a lab, or handles raw materials, you cross into immediate regulatory territory regardless of your company's age or size." },
      { type: "kv", label: "Hazardous Materials & Bio-Waste", text: "If you run a biotech lab, you must track every ounce of chemical or biological waste from the day it enters your lab to the day a licensed waste management company hauls it away." },
      { type: "kv", label: "Supply Chain Transparency (Product Lifecycle)", text: "Hardware startups should immediately track the materials going into their products (e.g., verifying compliance with RoHS or REACH standards for restricted toxic substances). Fixing a toxic or non-recyclable supply chain component at Series B is ten times more expensive than designing it correctly at the Seed stage." },
    ],
  },
  {
    type: "doc",
    title: "💡 The Early-Stage Playbook",
    body: [
      { type: "p", text: "Don't hire a consultant yet." },
      { type: "list", style: "bullet", items: [
        "Use free, basic carbon accounting calculators to get a baseline estimate of your team's office and travel emissions.",
        'Build a single-page "Sustainability Statement" outlining your current baseline and your commitment to tracking these as you grow.',
        "Host your tech stack in cloud regions optimized for renewable energy—AWS, Google, and Microsoft all provide regional carbon footprint tools directly in their management consoles for free.",
      ] },
    ],
  },

  { type: "doc-divider", title: "what is in the market" },
  {
    type: "doc",
    title: "The Free Carbon Calculator Market Landscape",
    body: [
      { type: "p", text: "Free business carbon calculators generally fall into three distinct market categories:" },
    ],
  },
  {
    type: "doc",
    title: '1. The "Freemium" Lead Generators (Commercial Software Platforms)',
    body: [
      { type: "p", text: "Enterprise ESG platforms build free, lightweight versions of their software to capture startup leads early." },
      { type: "kv", label: "Major Players", text: "Plan A (Free Business Carbon Calculator), Seedling, Sustain.Life, and Normative (via the SME Climate Hub)." },
      { type: "kv", label: "The Experience", text: "They feature polished, user-friendly UI/UX. You input simple operational data (headcount, office square footage, annual flight spend) and instantly get pretty visual charts of your estimated footprint." },
      { type: "kv", label: "The Catch", text: "They are heavily restricted. They typically only calculate basic Scope 1 and Scope 2 metrics. The second you try to upload automated utility bills, track deeper supply chain data (Scope 3), or export a third-party verified report to give to an enterprise buyer, you hit a paywall." },
    ],
  },
  {
    type: "doc",
    title: "2. The Institutional Baseline Tools (Government & Academic)",
    body: [
      { type: "p", text: "These are free, open-source utilities built to help small businesses establish a defensible regulatory baseline without commercial pressure." },
      { type: "kv", label: "Major Players", text: "The US EPA (Simplified GHG Emissions Calculator) and UC Berkeley's CoolClimate Network." },
      { type: "kv", label: "The Experience", text: "The EPA tool is a massive, macro-enabled Excel sheet. It is clunky, aesthetic-free, and requires you to manually look up utility bills and fuel receipts." },
      { type: "kv", label: "The Value", text: "What it lacks in design, it makes up for in raw data integrity. It uses official, localized U.S. emission factor hubs (eGrid data). Unlike a startup commercial tool that might disappear or change its pricing next year, the EPA spreadsheet is a globally accepted baseline that enterprise compliance auditors will immediately respect." },
    ],
  },
  {
    type: "doc",
    title: "3. Built-In Infrastructure Dashboards (Cloud Providers)",
    body: [
      { type: "p", text: "If you are a tech or SaaS startup, your largest emissions footprint is your cloud infrastructure. Cloud providers give you these calculators for free because you are already paying for their servers." },
      { type: "kv", label: "Major Players", text: "AWS Customer Carbon Footprint Tool, Google Cloud Carbon Footprint, and Microsoft Sustainability Manager (basic tiers)." },
      { type: "kv", label: "The Experience", text: "Integrated directly into your cloud billing console. They automatically convert your data storage and compute usage into metric tons of CO₂e. They are highly accurate for your digital footprint, though they won't track your physical office or team travel." },
    ],
  },
  {
    type: "doc",
    title: "Market Dynamics: The Shift Toward Activity-Based Data",
    body: [
      { type: "p", text: "The free calculator market has undergone a significant shift in data quality:" },
      { type: "kv", label: "Past (Spend-Based)", text: 'Older free calculators used basic financial modeling (e.g., "You spent $5,000 on flights, so your footprint is X"). This is incredibly inaccurate due to price inflation and varying ticket costs.' },
      { type: "kv", label: "Present (Activity-Based)", text: "Modern free tools (like Seedling's free tier or the SME Climate Hub tool) require real activity inputs (e.g., \"You flew 12,000 passenger-miles\" or \"You consumed 4,000 kWh of electricity\"). This gives startups a highly accurate baseline that actually changes when they implement energy-saving behaviors." },
    ],
  },
  {
    type: "doc",
    title: "The Verdict for Startups",
    body: [
      { type: "table", head: ["Tool Type", "Best For", "When to Avoid"], rows: [
        ["Commercial Freemium (Plan A, Seedling)", "Quick pitch-deck graphics, investor updates, and fast 3-minute estimates.", "When you need audited, certified reporting for a strict government contract."],
        ["Institutional Excel (EPA Calculator)", "Deep, defensible audits and heavy operational tracking on a $0 budget.", "If you hate spreadsheets and need automated data ingestion."],
        ["Cloud Consoles (AWS / Google Cloud)", "Instantly checking your SaaS product's infrastructure footprint.", "When you need to report on your overall company operations (offices, travel)."],
      ] },
    ],
  },

  { type: "doc-divider", title: "what we are providing" },
  {
    type: "doc",
    title: "1. Core Forecasting Components",
  },
  {
    type: "doc",
    title: "A. Growth-Coupled Emissions Projector",
    body: [
      { type: "kv", label: "What it is", text: "A forecasting engine that models future emissions based on company growth vectors." },
      { type: "kv", label: "The Inputs", text: "Headcount growth, projected infrastructure scale (e.g., cloud spend or compute hours), and physical footprint expansion (office square footage)." },
      { type: "kv", label: "The Output", text: "A forward-looking line graph showing projected MTCO₂e (Metric Tons of CO₂ Equivalent) over a 3 to 5-year runway." },
      { type: "kv", label: "Why it's needed", text: "Startups scale exponentially; historical data is irrelevant for managing their future trajectory. This isolates whether emissions growth is decoupled from or directly tied to business revenue scaling." },
    ],
  },
  {
    type: "doc",
    title: "B. Cloud Architecture & Grid Decarbonization Scenario Modeler",
    body: [
      { type: "kv", label: "What it is", text: "A simulator that models the future impact of a startup's software architecture across different cloud hosting regions." },
      { type: "kv", label: "The Data Engine", text: "It combines the startup's projected compute/storage needs with regional grid emission factor projections (how clean a specific local power grid is expected to get over time)." },
      { type: "kv", label: "Why it's needed", text: "A startup hosting workloads in a carbon-heavy region (e.g., AWS US-East-1 in Virginia) can toggle their future scenario to a cleaner grid (e.g., US-West-2 in Oregon) to instantly view their future structural emissions reduction." },
    ],
  },
  {
    type: "doc",
    title: 'C. Transition Risk & "Stranding Year" Tracker',
    body: [
      { type: "kv", label: "What it is", text: "A visualization component that shows the exact calendar year the startup's business model will exceed global climate thresholds if no changes are made." },
      { type: "kv", label: "Why it's needed", text: "It shifts sustainability from a vague goal to an operational deadline. It calculates when the startup's carbon intensity will conflict with mandatory enterprise procurement rules or supply chain regulations." },
    ],
  },
  {
    type: "doc",
    title: "2. Established Global Indices to Integrate",
    body: [
      { type: "p", text: "Do not invent a proprietary scoring system. Startups require integration with recognized, auditable standards to ensure their dashboard metrics carry weight with future partners and investors:" },
    ],
  },
  {
    type: "doc",
    title: "I. The Science Based Targets initiative (SBTi) Target-Setting Pathways",
    body: [
      { type: "kv", label: "How it works on the dashboard", text: "The dashboard uses the SBTi Corporate Net-Zero Standard mathematical formulas. It superimposes a \"1.5°C-aligned reduction pathway\" directly onto the startup's growth projection graph." },
      { type: "kv", label: "The Application", text: "It gives the startup a precise, science-backed maximum emissions ceiling for every future year, showing exactly how much they must reduce or optimize as they grow to remain compliant with global corporate standards." },
    ],
  },
  {
    type: "doc",
    title: "II. IEA Grid Decarbonization Pathways",
    body: [
      { type: "kv", label: "How it works on the dashboard", text: "The platform must ingest data from the International Energy Agency (IEA) World Energy Outlook decarbonization scenarios (specifically the Stated Policies Scenario or Net Zero Emissions by 2050 Scenario)." },
      { type: "kv", label: "The Application", text: "As power grids naturally transition to renewable energy over the next decade, the dashboard automatically adjusts the startup's projected Scope 2 and Scope 3 cloud emissions downward. This ensures the startup does not over-report their future impact by using frozen, static today-era emission factors." },
    ],
  },
  {
    type: "doc",
    title: "III. The CRREM Stranding Risk Methodology",
    body: [
      { type: "kv", label: "How it works on the dashboard", text: 'Derived from the Carbon Risk Real Estate Monitor (CRREM), which defines the exact "Stranding Year" concept where an operational asset\'s carbon intensity (kgCO₂e/m² or kgCO₂e per unit revenue) crosses the threshold of international compliance.' },
      { type: "kv", label: "The Application", text: 'The dashboard uses this math to generate a clear countdown clock (e.g., "Current operational architecture at risk of supply-chain exclusion by 2031").' },
    ],
  },
];

SLIDES.forEach((s, i) => { s.id = s.id || ("s" + (i + 1)); });

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
          h(
            "span",
            null,
            h(
              "strong",
              null,
              it.label + (/\p{P}$/u.test(it.label) ? " " : ". ")
            ),
            it.body
          )
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

/* ------------------------------------------------------------
   Doc slide — verbatim long-form content. Renders structured
   blocks (paragraphs, headings, lists, tables) exactly as the
   author wrote them. Inline **bold** markers are honored.

   Block types:
     { type: "p", text: string }
     { type: "h3", text: string }
     { type: "h4", text: string }
     { type: "lead", text: string }   // lead-paragraph style
     { type: "kv", label: string, text: string }
     { type: "list", style: "num"|"bullet"|"letter"|"roman",
       items: [
         string |                              // plain text
         { heading?: string, body: string | Block[] }
       ] }
     { type: "table", head?: string[], rows: string[][] }
   ------------------------------------------------------------ */

function renderInline(text) {
  const str = String(text);
  const parts = str.split(/(\*\*[^*]+?\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? h("strong", { key: "b" + i }, p.slice(2, -2))
      : p
  );
}

function renderDocBody(blocks) {
  return (blocks || []).map((b, i) => renderDocBlock(b, i));
}

function renderDocBlock(b, i) {
  switch (b.type) {
    case "p":
      return h("p", { key: i, className: "doc-p" }, renderInline(b.text));
    case "lead":
      return h("p", { key: i, className: "doc-lead-text" }, renderInline(b.text));
    case "h3":
      return h("h3", { key: i, className: "doc-h3" }, b.text);
    case "h4":
      return h("h4", { key: i, className: "doc-h4" }, b.text);
    case "kv":
      return h(
        "p",
        { key: i, className: "doc-p" },
        h("strong", null, b.label + (/\p{P}$/u.test(b.label) ? " " : ": ")),
        ...renderInline(b.text)
      );
    case "list":
      return renderDocList(b, i);
    case "table":
      return renderDocTable(b, i);
    default:
      return null;
  }
}

function renderDocList(b, i) {
  const Tag = b.style === "bullet" ? "ul" : "ol";
  return h(
    Tag,
    { key: i, className: "doc-list", "data-style": b.style || "num" },
    b.items.map((item, j) => {
      if (typeof item === "string") {
        return h("li", { key: j, className: "doc-list-item" }, renderInline(item));
      }
      const body = item.body;
      const bodyChildren = Array.isArray(body)
        ? body.map((sub, k) => renderDocBlock(sub, k))
        : [h("p", { className: "doc-p" }, renderInline(body))];
      return h(
        "li",
        { key: j, className: "doc-list-item" },
        item.heading
          ? h("h4", { className: "doc-list-item-heading" }, item.heading)
          : null,
        h("div", { className: "doc-list-item-body" }, bodyChildren)
      );
    })
  );
}

function renderDocTable(b, i) {
  return h(
    "table",
    { key: i, className: "doc-table" },
    b.head
      ? h(
          "thead",
          null,
          h(
            "tr",
            null,
            b.head.map((cell, k) => h("th", { key: k }, cell))
          )
        )
      : null,
    h(
      "tbody",
      null,
      b.rows.map((row, r) =>
        h(
          "tr",
          { key: r },
          row.map((cell, c) => h("td", { key: c }, ...renderInline(cell)))
        )
      )
    )
  );
}

function DocSlide({ slide }) {
  return h(
    "div",
    { className: "slide doc-slide" },
    slide.title
      ? h("h2", { className: "slide-title doc-title" }, slide.title)
      : null,
    h("div", { className: "doc-body" }, renderDocBody(slide.body))
  );
}

function DocDividerSlide({ slide }) {
  return h(
    "div",
    { className: "slide doc-divider" },
    h("h2", { className: "slide-title doc-title-divider" }, slide.title)
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
  doc: DocSlide,
  "doc-divider": DocDividerSlide,
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
          s.title ||
          s.quote ||
          s.lead ||
          (Array.isArray(s.body)
            ? (s.body.find((b) => b && b.text) &&
                (s.body.find((b) => b && b.text).text.length > 80
                  ? s.body.find((b) => b && b.text).text.slice(0, 80) + "\u2026"
                  : s.body.find((b) => b && b.text).text)) ||
              "Slide"
            : s.type === "closing"
              ? "End"
              : "Slide");
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
