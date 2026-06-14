/* ==========================================================================
   CURATED EVIDENCE LIBRARY  (shared by app.js frontend + worker backend)
   --------------------------------------------------------------------------
   Single source of truth for the *backing* behind every number, claim, and
   recommendation in the product:

     - FACTOR_SOURCES   why each default emission factor is what it is
     - FRAMEWORKS       the theories/standards the methodology rests on
     - BENCHMARKS       transparent peer ranges (factor x headcount, sourced)
     - CASE_PRECEDENTS  real, citable examples behind the risks we flag

   Honesty rules baked in here:
     - Every entry names a real, public source + URL + year.
     - Default factors are labelled as MODELLED estimates, never measurements.
     - Benchmarks are derived ranges (per-FTE x typical headcount), not a
       proprietary peer dataset, and say so.
     - Regulatory precedents carry a status/date because they move.

   The AI report is allowed to cite ONLY from this library (see buildFactPack).
   ========================================================================== */

// --- Emission factor provenance -------------------------------------------
// Keyed to ACTIVITIES_DB ids in app.js. `basis` explains how the default
// value is derived for an early-stage startup so the number is traceable.
export const FACTOR_SOURCES = {
  "compute": {
    label: "Cloud & AI Compute",
    source: "GHG Protocol ICT Sector Guidance + Software Carbon Intensity (SCI) spec",
    publisher: "GHG Protocol / Green Software Foundation (ISO/IEC 21031:2024)",
    year: 2024,
    url: "https://ghgprotocol.org/guidance-built-ghg-protocol",
    methodology: "Cloud usage converted via provider region carbon intensity and PUE; SCI = (E x I) + M per functional unit.",
    basis: "Per-FTE cloud/AI compute for a small software team, from typical SaaS+inference spend and hyperscaler carbon disclosures. Replace with billing-derived kWh to move off the default."
  },
  "hardware": {
    label: "Hardware & Electronics",
    source: "Product Carbon Footprint reports (Apple, Dell) + GHG Protocol capital goods (Cat. 2)",
    publisher: "OEM environmental reports / GHG Protocol Scope 3 Standard",
    year: 2024,
    url: "https://ghgprotocol.org/standards/scope-3-standard",
    methodology: "Embodied (cradle-to-gate) device carbon amortised over a 4-year life.",
    basis: "~200-350 kgCO2e per laptop manufactured, amortised across team devices. Refurbished hardware cuts this sharply."
  },
  "travel": {
    label: "FTE Travel & Commutes",
    source: "UK DESNZ/DEFRA GHG Conversion Factors + US EPA GHG Emission Factors Hub",
    publisher: "UK Dept. for Energy Security & Net Zero / US EPA",
    year: 2024,
    url: "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting",
    methodology: "Activity-based: distance x mode factor (air haul class, rail, car) and commute days x mode.",
    basis: "Per-FTE business travel + commuting for a hybrid team. Distance-based factors are well-established; the unknown is your actual travel volume."
  },
  "vendors": {
    label: "Key Vendors & SaaS",
    source: "US EPA USEEIO v2 (spend-based environmentally-extended input-output)",
    publisher: "US EPA / EXIOBASE",
    year: 2023,
    url: "https://www.epa.gov/land-research/us-environmentally-extended-input-output-useeio-models",
    methodology: "Spend ($) x sector emission intensity (kgCO2e per $) for professional services & software.",
    basis: "Spend-based estimate for purchased services/SaaS. Coarse by design; supplier-specific factors improve it materially."
  },
  "logistics": {
    label: "Logistics & Distribution",
    source: "GLEC Framework (Smart Freight Centre) + DEFRA freight factors",
    publisher: "Smart Freight Centre / DESNZ",
    year: 2023,
    url: "https://www.smartfreightcentre.org/en/how-to-implement-items/what-is-glec-framework/",
    methodology: "Tonne-kilometre x mode factor (road/rail/sea/air), the ISO 14083 logistics accounting standard.",
    basis: "Default tonne-km estimate for physical movement of goods. Real shipment data (weight, distance, mode) replaces it directly."
  },
  "scope2-grid": {
    label: "Purchased Electricity (Scope 2)",
    source: "US EPA eGRID + IEA national grid intensity",
    publisher: "US EPA / International Energy Agency",
    year: 2024,
    url: "https://www.epa.gov/egrid",
    methodology: "Location-based: kWh x regional grid average emission factor. Market-based uses contractual instruments (RECs/PPAs).",
    basis: "Estimated office/lab electricity at average grid intensity. A utility bill (kWh) and your grid region make this measured."
  },
  "scope1-direct": {
    label: "Direct Emissions (Scope 1)",
    source: "UK DESNZ/DEFRA stationary & mobile combustion factors + IPCC GWP",
    publisher: "DESNZ / IPCC AR6 GWP100",
    year: 2024,
    url: "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting",
    methodology: "Fuel/refrigerant quantity x factor; refrigerants weighted by IPCC GWP100.",
    basis: "Default on-site combustion + fugitive (gas heating, fleet fuel, refrigerant leakage). Often near-zero for cloud-only teams."
  },
  "avoided-grid": { label: "Grid Decarbonization", ...avoidedSource("grid electricity displaced by a cleaner alternative") },
  "avoided-transport": { label: "Transport Avoidance", ...avoidedSource("higher-carbon transport displaced by your solution") },
  "avoided-material": { label: "Low-Carbon Materials", ...avoidedSource("conventional materials displaced by a low-carbon substitute") }
};

function avoidedSource(what) {
  return {
    source: "GHG Protocol Project Protocol + Project Frame avoided-emissions guidance",
    publisher: "WRI/WBCSD / Project Frame",
    year: 2023,
    url: "https://www.project-frame.earth/resources",
    methodology: "Counterfactual: (baseline scenario emissions) - (solution scenario emissions), gated on additionality.",
    basis: `Avoided emissions from ${what}. Reported separately from your footprint and only credited when additionality is demonstrated. Defaults to 0 until you supply a baseline.`
  };
}

// --- Theories / standards the methodology rests on ------------------------
export const FRAMEWORKS = [
  { id: "ghgp", name: "GHG Protocol Corporate + Scope 3 Standard",
    what: "The accounting backbone: defines Scope 1/2/3 and the 15 value-chain categories used to classify every activity here.",
    url: "https://ghgprotocol.org/corporate-standard" },
  { id: "sbti", name: "Science Based Targets initiative (SBTi)",
    what: "How a startup sets a 1.5C-aligned reduction target investors recognise; the destination the goals point toward.",
    url: "https://sciencebasedtargets.org/" },
  { id: "sci", name: "Software Carbon Intensity (SCI), ISO/IEC 21031:2024",
    what: "A rate-based metric for software/AI compute emissions; the basis for the cloud-compute factor and its goal template.",
    url: "https://sci.greensoftware.foundation/" },
  { id: "frame", name: "Project Frame",
    what: "The emerging market standard for estimating and reporting avoided emissions (handprint) for climate VC diligence.",
    url: "https://www.project-frame.earth/" },
  { id: "additionality", name: "Additionality (GHG Protocol Project Protocol)",
    what: "The test that a reduction would not have happened anyway; the gate every handprint claim must pass before it counts.",
    url: "https://ghgprotocol.org/project-protocol" },
  { id: "rebound", name: "Rebound Effect (Jevons Paradox)",
    what: "Efficiency lowers cost and can raise total demand; why a compute-efficiency win can be partly eaten by more usage.",
    url: "https://ukerc.ac.uk/publications/the-rebound-effect-an-assessment-of-the-evidence-for-economy-wide-energy-savings-from-improved-energy-efficiency/" }
];

// --- Peer benchmarks (transparent, derived ranges) ------------------------
// Not a proprietary peer dataset: range = typical headcount-at-stage x a
// per-FTE operational footprint for digital-first startups, both sourced.
export const BENCHMARKS = {
  perFte: {
    low: 1.5, high: 4.0, unit: "tCO2e/FTE/yr",
    source: "Derived from DESNZ/EPA per-capita office, travel & electricity factors for digital-first SMEs",
    url: "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting",
    note: "Operational (Scope 1-2 + business travel/compute). Hardware-heavy or logistics models run higher; verify against your own data."
  },
  stages: {
    "Pre-seed": { fteLow: 2, fteHigh: 8 },
    "Seed": { fteLow: 5, fteHigh: 15 },
    "Series A": { fteLow: 15, fteHigh: 40 },
    "Series B": { fteLow: 40, fteHigh: 120 },
    "Growth": { fteLow: 80, fteHigh: 250 }
  }
};

// Returns an indicative peer footprint range for a company, preferring the
// real team size and falling back to typical headcount for the stage.
export function computeBenchmark(stage, teamSize) {
  const b = BENCHMARKS;
  const s = b.stages[stage] || null;
  const fte = Number(teamSize) > 0 ? Number(teamSize) : null;
  const lowFte = fte || (s ? s.fteLow : 5);
  const highFte = fte || (s ? s.fteHigh : 15);
  return {
    stage: stage || "unknown stage",
    basisFte: fte ? `${fte} FTEs (your team)` : (s ? `${s.fteLow}-${s.fteHigh} FTEs (typical at ${stage})` : "5-15 FTEs (assumed)"),
    low: +(lowFte * b.perFte.low).toFixed(1),
    high: +(highFte * b.perFte.high).toFixed(1),
    perFte: b.perFte,
    indicative: true
  };
}

// --- Real, citable precedents behind the risks we raise -------------------
// Status/date included because regulation moves; the product should make the
// dependency explicit rather than assert a rule applies.
export const CASE_PRECEDENTS = [
  { id: "csrd", title: "EU CSRD value-chain disclosure",
    summary: "The Corporate Sustainability Reporting Directive pulls suppliers into large customers' Scope 3 reporting, so enterprise buyers increasingly ask vendors for emissions data.",
    relevance: "Selling into large EU enterprises can make your footprint a procurement requirement.",
    status: "Adopted 2022; scope being narrowed by the 2025 Omnibus package - verify current thresholds.",
    source: "European Commission", year: 2024,
    url: "https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en" },
  { id: "ca-sb253", title: "California SB 253 / SB 261",
    summary: "Climate Corporate Data Accountability Act requires Scope 1-3 disclosure for large companies doing business in California, with reporting phasing in from 2026.",
    relevance: "If you sell to or partner with large California firms, expect Scope 3 data requests downstream.",
    status: "Enacted 2023; implementation timeline and litigation ongoing - verify.",
    source: "California Air Resources Board", year: 2023,
    url: "https://ww2.arb.ca.gov/our-work/programs/climate-corporate-data-accountability-act" },
  { id: "rebound", title: "Compute-efficiency rebound (Jevons)",
    summary: "UKERC's review of the rebound effect documents how efficiency gains are partly offset by increased use - directly relevant when optimising AI/cloud cost lowers the price of running more inference.",
    relevance: "Cloud-cost wins may not cut absolute emissions unless usage is also governed.",
    status: "Peer-reviewed evidence base.",
    source: "UK Energy Research Centre (Sorrell)", year: 2007,
    url: "https://ukerc.ac.uk/publications/the-rebound-effect-an-assessment-of-the-evidence-for-economy-wide-energy-savings-from-improved-energy-efficiency/" },
  { id: "greenwash", title: "Avoided-emissions / greenwashing scrutiny",
    summary: "Regulators (e.g. EU Green Claims Directive) and Project Frame both push for conservative, additionality-gated avoided-emissions claims rather than headline 'net positive' numbers.",
    relevance: "Overstating handprint without a verified baseline is a diligence and legal risk at raise time.",
    status: "EU Green Claims Directive in negotiation - verify; Project Frame guidance current.",
    source: "European Commission / Project Frame", year: 2024,
    url: "https://www.project-frame.earth/" }
];

// --- Carbon price translation (footprint -> potential future expense) -----
// Two anchored scenarios: today's compliance market price and the social cost
// of carbon (a proxy for future policy/liability exposure). This is a forward-
// looking estimate, not a bill - the UI must label it as such.
export const CARBON_PRICES = {
  currency: "USD",
  scenarios: [
    {
      id: "ets", label: "Compliance price (EU ETS)", usdPerTonne: 75,
      source: "EU Emissions Trading System / ICAP Allowance Price Explorer", year: 2025,
      url: "https://icapcarbonaction.com/en/ets-prices",
      note: "What a regulated emitter pays per tonne in the EU carbon market today."
    },
    {
      id: "scc", label: "Social cost of carbon (US EPA)", usdPerTonne: 190,
      source: "US EPA Report on the Social Cost of Greenhouse Gases", year: 2023,
      url: "https://www.epa.gov/environmental-economics/scghg",
      note: "Estimated societal damage per tonne - a proxy for future policy/liability exposure."
    }
  ]
};

// Translate annual tonnes into a low-high cost band across the scenarios.
export function priceFootprint(tonnes) {
  const t = Number(tonnes) || 0;
  const lines = CARBON_PRICES.scenarios.map(s => ({
    id: s.id, label: s.label, usdPerTonne: s.usdPerTonne,
    usd: Math.round(t * s.usdPerTonne), source: s.source, url: s.url, note: s.note, year: s.year
  }));
  const values = lines.map(l => l.usd);
  return {
    currency: CARBON_PRICES.currency,
    low: Math.min(...values), high: Math.max(...values),
    lines, indicative: true
  };
}

// --- Impact beyond carbon (multi-dimension profile) -----------------------
// Climate/environmental impact is not only CO2. Where a defensible derivation
// chain exists we model the dimension (energy, water, waste); where credible
// numbers don't exist for software-first startups we keep it qualitative
// (land & biodiversity materiality), rather than inventing figures.
export const IMPACT_DIMENSIONS = {
  energy: {
    label: "Energy use", unit: "kWh/yr", type: "modeled",
    source: "Derived from IEA grid carbon intensity",
    url: "https://www.iea.org/data-and-statistics",
    note: "Back-calculated from electricity & fuel emissions at ~0.40 kgCO2e/kWh. Replace with metered kWh."
  },
  water: {
    label: "Water use", unit: "m³/yr", type: "modeled",
    source: "Data-centre & thermoelectric water intensity (LBNL / Water Footprint Network)",
    url: "https://www.osti.gov/biblio/1846249",
    note: "Estimated at ~1.8 L per kWh of electricity (cooling + power generation). Indicative."
  },
  waste: {
    label: "Waste & e-waste", unit: "kg/yr", type: "modeled",
    source: "Global E-waste Monitor (UNITAR/ITU) + US EPA WARM",
    url: "https://ewastemonitor.info/",
    note: "From hardware end-of-life and packaging defaults. Replace with disposal records; third-party data-center e-waste is not inferred without vendor data."
  },
  nature: {
    label: "Land & biodiversity", unit: "materiality", type: "qualitative",
    source: "Science Based Targets Network (SBTN) + TNFD",
    url: "https://sciencebasedtargetsnetwork.org/",
    note: "Software-first startups rarely have credible land/biodiversity figures; flagged qualitatively where the value chain (hardware mining, logistics infrastructure) makes it material."
  }
};

const IMPACT_CONSTANTS = { gridKgPerKwh: 0.40, wueLitrePerKwh: 1.8 };
const ELECTRIC_ACTIVITIES = ["compute", "scope2-grid"];
const ENERGY_ACTIVITIES = ["compute", "scope2-grid", "scope1-direct"];
const ACTIVITY_WASTE_KG = { hardware: 40, logistics: 30 };
const ACTIVITY_NATURE = { hardware: "medium", logistics: "medium" }; // mining / land infra
const NATURE_RANK = { low: 1, medium: 2, high: 3 };

// Build the multi-dimension impact profile from the modeled carbon breakdown.
// Numbers are transparently derived from the carbon model (same defaults), so
// they carry the same "modeled, replace with real data" caveat.
export function computeImpactProfile(snapshot = {}, activities = [], businessModel = "") {
  const breakdown = Array.isArray(snapshot.breakdown) ? snapshot.breakdown : [];
  const acts = Array.isArray(activities) ? activities : [];
  const c = IMPACT_CONSTANTS;
  const tonnesFor = ids => breakdown
    .filter(b => ids.includes(b.id))
    .reduce((sum, b) => sum + (b.value || 0), 0);

  const energyKwh = Math.round((tonnesFor(ENERGY_ACTIVITIES) * 1000) / c.gridKgPerKwh);
  const elecKwh = (tonnesFor(ELECTRIC_ACTIVITIES) * 1000) / c.gridKgPerKwh;
  const waterM3 = +((elecKwh * c.wueLitrePerKwh) / 1000).toFixed(1);
  let wasteKg = acts.reduce((sum, k) => sum + (ACTIVITY_WASTE_KG[k] || 0), 0);
  let wasteNote = IMPACT_DIMENSIONS.waste.note;
  let wastePending = wasteKg === 0;

  const bmLower = String(businessModel || "").toLowerCase();
  const isPetBusiness = /pet|animal|dog|cat|veterinary/i.test(bmLower);
  const isFoodBusiness = /food|agri|farm|beverage|restaurant/i.test(bmLower);

  if (isPetBusiness) {
    const teamScale = snapshot.scaleFactor || 1;
    const petWasteDefault = 120 * teamScale;
    wasteKg += petWasteDefault;
    wastePending = false;
    wasteNote = "From hardware end-of-life and packaging defaults, plus modeled organic/pet waste defaults. Replace with actual waste audit and disposal records.";
  } else if (isFoodBusiness) {
    const teamScale = snapshot.scaleFactor || 1;
    const foodWasteDefault = 150 * teamScale;
    wasteKg += foodWasteDefault;
    wastePending = false;
    wasteNote = "From hardware end-of-life and packaging defaults, plus modeled organic food waste defaults. Replace with organic waste composting/disposal records.";
  } else if (wastePending && bmLower && !/saas|software|cloud|digital/i.test(bmLower)) {
    const teamScale = snapshot.scaleFactor || 1;
    wasteKg = 50 * teamScale;
    wastePending = false;
    wasteNote = "Estimated baseline commercial waste for non-digital business models. Replace with real disposal records.";
  }

  const natureDrivers = acts.filter(k => ACTIVITY_NATURE[k]);
  const natureLevel = natureDrivers.reduce(
    (lvl, k) => Math.max(lvl, NATURE_RANK[ACTIVITY_NATURE[k]] || 0), 1
  );
  const natureLabel = ["", "low", "medium", "high"][natureLevel] || "low";

  return {
    energy: { ...IMPACT_DIMENSIONS.energy, value: energyKwh },
    water: { ...IMPACT_DIMENSIONS.water, value: waterM3 },
    waste: {
      ...IMPACT_DIMENSIONS.waste,
      value: wastePending ? null : Math.round(wasteKg),
      pending: wastePending,
      pendingLabel: "Pending vendor data",
      note: wastePending
        ? "No direct hardware, logistics, disposal, or vendor waste records were supplied. Treat this as a data gap, not zero waste."
        : wasteNote
    },
    nature: { ...IMPACT_DIMENSIONS.nature, level: natureLabel, drivers: natureDrivers }
  };
}

// --- Fact pack for the AI report (hybrid grounding) -----------------------
// Selects the curated facts relevant to one assessment and renders a compact,
// citation-ready block. The prompt instructs the model to cite ONLY from here.
export function buildFactPack(assessment = {}) {
  const a = assessment || {};
  const activities = Array.isArray(a.activities) ? a.activities : [];
  const factors = activities
    .map(id => FACTOR_SOURCES[id])
    .filter(Boolean)
    .map(f => `${f.label}: default is a MODELLED estimate. Source: ${f.source} (${f.publisher}, ${f.year}). Basis: ${f.basis}`);

  const bench = computeBenchmark(a.stage, a.teamSize);
  const benchmark = `Indicative peer range for ${bench.basisFte}: ~${bench.low}-${bench.high} tCO2e/yr (${BENCHMARKS.perFte.low}-${BENCHMARKS.perFte.high} ${BENCHMARKS.perFte.unit}). ${BENCHMARKS.perFte.note} Source: ${BENCHMARKS.perFte.source}.`;

  const impact = computeImpactProfile(a.snapshot || {}, activities, a.businessModel);
  const wasteText = impact.waste.pending ? impact.waste.pendingLabel : `~${impact.waste.value} kg/yr`;
  const dimensions = `Impact beyond carbon (modeled/qualitative, replace with real data): Energy ~${impact.energy.value.toLocaleString()} kWh/yr; Water ~${impact.water.value} m³/yr; Waste: ${wasteText}; Land & biodiversity materiality: ${impact.nature.level}${impact.nature.drivers.length ? ` (via ${impact.nature.drivers.join(", ")})` : ""}.`;

  const footprintTonnes = a.snapshot && a.snapshot.footprintTotal;
  const cost = footprintTonnes != null ? priceFootprint(footprintTonnes) : null;
  const costLine = cost
    ? `Potential future cost exposure (illustrative, not a bill): ~$${cost.low.toLocaleString()}-$${cost.high.toLocaleString()}/yr, pricing the modeled footprint at ${cost.lines.map(l => `${l.label} $${l.usdPerTonne}/t (${l.source})`).join(" and ")}.`
    : "Potential future cost exposure: unavailable (footprint not modeled).";

  const frameworks = FRAMEWORKS.map(f => `${f.name}: ${f.what}`);
  const precedents = CASE_PRECEDENTS.map(c => `${c.title} (${c.source}, ${c.year}): ${c.summary} Relevance: ${c.relevance} Status: ${c.status}`);

  return { factors, benchmark, costLine, dimensions, frameworks, precedents, citationLabels: citationLabels() };
}

// Stable list of allowed citation labels, so the model can reference sources
// by name and the UI can resolve them back to URLs.
export function citationLabels() {
  const fromFactors = Object.values(FACTOR_SOURCES).map(f => f.source);
  const fromFrameworks = FRAMEWORKS.map(f => f.name);
  const fromCases = CASE_PRECEDENTS.map(c => c.source);
  const fromPrices = CARBON_PRICES.scenarios.map(s => s.source);
  const fromDims = Object.values(IMPACT_DIMENSIONS).map(d => d.source);
  return Array.from(new Set([...fromFactors, ...fromFrameworks, ...fromCases, ...fromPrices, ...fromDims, BENCHMARKS.perFte.source]));
}

// Flat lookup (label/url) for rendering citations as links anywhere.
export function sourceLinks() {
  const out = {};
  Object.values(FACTOR_SOURCES).forEach(f => { out[f.source] = f.url; });
  FRAMEWORKS.forEach(f => { out[f.name] = f.url; });
  CASE_PRECEDENTS.forEach(c => { out[c.source] = c.url; });
  CARBON_PRICES.scenarios.forEach(s => { out[s.source] = s.url; });
  Object.values(IMPACT_DIMENSIONS).forEach(d => { out[d.source] = d.url; });
  out[BENCHMARKS.perFte.source] = BENCHMARKS.perFte.url;
  return out;
}
