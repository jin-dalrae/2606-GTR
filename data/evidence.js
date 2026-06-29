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
    basis: "Per-FTE cloud/AI compute baseline from typical operational spend and hyperscaler carbon disclosures. Replace with billing-derived kWh to move off the default."
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
    basis: "Spend-based estimate for purchased services and tools. Coarse by design; supplier-specific factors improve it materially."
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
    url: "https://ukerc.ac.uk/publications/the-rebound-effect-an-assessment-of-the-evidence-for-economy-wide-energy-savings-from-improved-energy-efficiency/" },
  { id: "iso-lca", name: "ISO 14040/14044 (Life Cycle Assessment)",
    what: "The international standard for modeling the cradle-to-grave lifecycle footprint of physical products (raw materials, production, use, and disposal).",
    url: "https://www.iso.org/standard/37456.html" },
  { id: "ghgp-product", name: "GHG Protocol Product Life Cycle Standard",
    what: "Defines how to measure greenhouse gas emissions of a product throughout its lifecycle, crucial for hardware supply chain audits.",
    url: "https://ghgprotocol.org/product-standard" }
];

export const BENCHMARKS = {
  perFte: {
    low: 1.5, high: 4.0, unit: "tCO2e/FTE/yr",
    source: "Derived from DESNZ/EPA per-capita office, travel & electricity factors for digital-first SMEs",
    url: "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting",
    note: "Operational (Scope 1-2 + business travel/compute). Hardware-heavy or logistics models run higher; verify against your own data."
  },
  sectors: {
    "SaaS": { low: 1.5, high: 4.0, unit: "tCO2e/FTE/yr", note: "Office operations and cloud compute emissions.", source: "DESNZ/EPA digital-first SMEs", url: "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting" },
    "Hardware": { low: 15.0, high: 45.0, unit: "tCO2e/FTE/yr", note: "Includes physical prototyping facilities and outsourced Scope 3 supply chain manufacturing.", source: "Product Lifecycle LCA / Apple & Dell OEM averages", url: "https://ghgprotocol.org/standards/scope-3-standard" },
    "Food and Beverage": { low: 12.0, high: 35.0, unit: "tCO2e/FTE/yr", note: "Includes supply chain agriculture, raw ingredients, logistics, and processing.", source: "GHG Protocol Food & Land Sector Guidance", url: "https://ghgprotocol.org/standards/scope-3-standard" },
    "Pet Services": { low: 8.0, high: 24.0, unit: "tCO2e/FTE/yr", note: "Includes organic pet waste processing, operations, and retail logistics.", source: "EPA WARM / US Census business footprint baselines", url: "https://ewastemonitor.info/" },
    "Biotech": { low: 10.0, high: 30.0, unit: "tCO2e/FTE/yr", note: "Includes high power lab equipment operations, clinical waste disposal, and diagnostics shipping.", source: "My Green Lab / SBTN Biotech benchmarks", url: "https://sciencebasedtargetsnetwork.org/" }
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
export function computeBenchmark(stage, teamSize, businessModel = "") {
  const b = BENCHMARKS;
  const s = b.stages[stage] || null;
  const fte = Number(teamSize) > 0 ? Number(teamSize) : null;
  const lowFte = fte || (s ? s.fteLow : 5);
  const highFte = fte || (s ? s.fteHigh : 15);

  const bmLower = String(businessModel || "").toLowerCase();
  const matchedSectors = [];

  if (bmLower.includes("hardware") || bmLower.includes("device") || bmLower.includes("physical")) {
    matchedSectors.push(b.sectors["Hardware"]);
  }
  if (bmLower.includes("food") || bmLower.includes("agri") || bmLower.includes("farm") || bmLower.includes("beverage") || bmLower.includes("restaurant")) {
    matchedSectors.push(b.sectors["Food and Beverage"]);
  }
  if (/pet|animal|dog|cat|veterinary/i.test(bmLower)) {
    matchedSectors.push(b.sectors["Pet Services"]);
  }
  if (bmLower.includes("biotech") || bmLower.includes("medical") || bmLower.includes("lab")) {
    matchedSectors.push(b.sectors["Biotech"]);
  }
  if (bmLower.includes("saas") || bmLower.includes("software") || bmLower.includes("cloud") || bmLower.includes("digital")) {
    matchedSectors.push(b.sectors["SaaS"]);
  }

  let activeBenchmark;
  if (matchedSectors.length === 0) {
    activeBenchmark = b.perFte;
  } else if (matchedSectors.length === 1) {
    activeBenchmark = matchedSectors[0];
  } else {
    // Aggregate multiple sectors: take max rates and combine notes/sources
    const maxLow = Math.max(...matchedSectors.map(sec => sec.low));
    const maxHigh = Math.max(...matchedSectors.map(sec => sec.high));
    const combinedNote = `Hybrid operations baseline combining: ${matchedSectors.map(sec => sec.note).join(" ")}`;
    const combinedSource = matchedSectors.map(sec => sec.source).join(" + ");
    const combinedUrl = matchedSectors[0].url; 
    activeBenchmark = {
      low: maxLow,
      high: maxHigh,
      unit: "tCO2e/FTE/yr",
      note: combinedNote,
      source: combinedSource,
      url: combinedUrl
    };
  }

  return {
    stage: stage || "unknown stage",
    basisFte: fte ? `${fte} FTEs (your team)` : (s ? `${s.fteLow}-${s.fteHigh} FTEs (typical at ${stage})` : "5-15 FTEs (assumed)"),
    low: +(lowFte * activeBenchmark.low).toFixed(1),
    high: +(highFte * activeBenchmark.high).toFixed(1),
    perFte: activeBenchmark,
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
    summary: "Climate Corporate Data Accountability Act requires Scope 1-3 disclosure for large companies doing business in California, with initial reporting frameworks now active as of 2026.",
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
    url: "https://www.project-frame.earth/" },
  { id: "rohs-weee", title: "WEEE & RoHS circular directives",
    summary: "The EU Waste Electrical and Electronic Equipment (WEEE) and Restriction of Hazardous Substances (RoHS) directives enforce strict collection, recycling, and chemical constraints on hardware manufacturers.",
    relevance: "Physical hardware brands must design for end-of-life disassembly and avoid restricted flame retardants/heavy metals to access global enterprise buyers.",
    status: "In force; ESPR ecodesign rules expanding requirements from 2026.",
    source: "European Commission", year: 2024,
    url: "https://environment.ec.europa.eu/topics/waste-and-recycling/waste-electrical-and-electronic-equipment-weee_en" },
  { id: "eudr", title: "EU Deforestation Regulation (EUDR)",
    summary: "Requires companies to prove that seven key commodities (cattle, cocoa, coffee, oil palm, rubber, soya, wood) do not originate from recently deforested land.",
    relevance: "Essential for food, beverage, and agricultural startups selling into or sourcing from the EU market.",
    status: "Enacted 2023; phased implementation starting late 2025/2026.",
    source: "European Commission", year: 2023,
    url: "https://green-business.ec.europa.eu/deforestation-regulation-implementation_en" },
  { id: "biotech-waste", title: "Biotech biohazardous & clinical waste compliance",
    summary: "RCRA and local EPA hazardous waste regulations govern disposal of clinical, biohazardous, and chemical laboratory waste, requiring strict chain-of-custody tracking.",
    relevance: "Biotech and laboratory startups face direct operational penalties if waste manifests are not tracked and logged.",
    status: "In force; audited by national and regional environmental agencies.",
    source: "US EPA / RCRA", year: 2024,
    url: "https://www.epa.gov/rcra" }
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
    note: "Office-based startups rarely have direct land/biodiversity footprints; flagged qualitatively where value-chain activities (like hardware raw materials or logistics infrastructure) have material biodiversity risks."
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
  let waterM3Val = (elecKwh * c.wueLitrePerKwh) / 1000;
  let waterNote = IMPACT_DIMENSIONS.water.note;
  let wasteKg = acts.reduce((sum, k) => sum + (ACTIVITY_WASTE_KG[k] || 0), 0);
  let wasteNote = IMPACT_DIMENSIONS.waste.note;
  let wastePending = wasteKg === 0;

  const bmLower = String(businessModel || "").toLowerCase();
  const isHardware = bmLower.includes("hardware") || bmLower.includes("device") || bmLower.includes("physical");
  const isPetBusiness = /pet|animal|dog|cat|veterinary/i.test(bmLower);
  const isFoodBusiness = /food|agri|farm|beverage|restaurant/i.test(bmLower);
  const isBiotech = bmLower.includes("biotech") || bmLower.includes("medical") || bmLower.includes("lab");

  const teamScale = snapshot.scaleFactor || 1;
  const matchedNotes = [];
  const matchedWaterNotes = [];

  if (isHardware) {
    const hardwareWasteDefault = 250 * teamScale;
    wasteKg += hardwareWasteDefault;
    wastePending = false;
    matchedNotes.push("Estimated facility prototyping, packaging, and laboratory assembly waste. Replace with raw material scrap and facility waste disposal records.");
  }
  if (isPetBusiness) {
    const petWasteDefault = 120 * teamScale;
    wasteKg += petWasteDefault;
    wastePending = false;
    matchedNotes.push("From hardware end-of-life and packaging defaults, plus modeled organic/pet waste defaults. Replace with actual waste audit and disposal records.");
  }
  if (isFoodBusiness) {
    const foodWasteDefault = 150 * teamScale;
    wasteKg += foodWasteDefault;
    wastePending = false;
    matchedNotes.push("From hardware end-of-life and packaging defaults, plus modeled organic food waste defaults. Replace with organic waste composting/disposal records.");
    const foodWaterDefault = 80 * teamScale;
    waterM3Val += foodWaterDefault;
    matchedWaterNotes.push("Includes estimated food processing and washdown water footprints. Replace with facility utility bills.");
  }
  if (isBiotech) {
    const biotechWasteDefault = 180 * teamScale;
    wasteKg += biotechWasteDefault;
    wastePending = false;
    matchedNotes.push("Estimated biohazardous, chemical, and clinical laboratory waste baseline. Replace with manifest disposal records.");
    const biotechWaterDefault = 45 * teamScale;
    waterM3Val += biotechWaterDefault;
    matchedWaterNotes.push("Estimated high laboratory process water usage (cleaning, autoclaves, diagnostics). Replace with facility utility bills.");
  }
  if (wastePending && bmLower && !/saas|software|cloud|digital/i.test(bmLower)) {
    wasteKg = 50 * teamScale;
    wastePending = false;
    matchedNotes.push("Estimated baseline commercial waste for non-digital business models. Replace with real disposal records.");
  }

  if (matchedNotes.length > 0) {
    wasteNote = matchedNotes.join(" ");
  }
  if (matchedWaterNotes.length > 0) {
    waterNote = matchedWaterNotes.join(" ");
  }

  const waterM3 = +(waterM3Val).toFixed(1);

  let natureDrivers = acts.filter(k => ACTIVITY_NATURE[k]);
  let natureLevel = natureDrivers.reduce(
    (lvl, k) => Math.max(lvl, NATURE_RANK[ACTIVITY_NATURE[k]] || 0), 1
  );
  let natureLabel = ["", "low", "medium", "high"][natureLevel] || "low";
  let natureNote = IMPACT_DIMENSIONS.nature.note;

  const natureNotes = [];
  if (isHardware) {
    natureLevel = Math.max(natureLevel, 3);
    natureDrivers = [...natureDrivers, "raw materials", "mining"];
    natureNotes.push("Raw material extraction (semiconductors, metals, plastics) and supply chain logistics mean your broader value chain has a highly material impact on land and biodiversity.");
  }
  if (isBiotech) {
    natureLevel = Math.max(natureLevel, 2);
    natureDrivers = [...natureDrivers, "chemical inputs", "hazardous waste"];
    natureNotes.push("Active laboratory chemical inputs, clinical reagents, and specialized hazardous waste disposal mean operations have a notable impact on local ecosystems.");
  }

  if (natureNotes.length > 0) {
    natureNote = natureNotes.join(" ");
  }
  natureLabel = ["", "low", "medium", "high"][natureLevel] || "low";

  return {
    energy: { ...IMPACT_DIMENSIONS.energy, value: energyKwh },
    water: { ...IMPACT_DIMENSIONS.water, value: waterM3, note: waterNote },
    waste: {
      ...IMPACT_DIMENSIONS.waste,
      value: wastePending ? null : Math.round(wasteKg),
      pending: wastePending,
      pendingLabel: "Pending vendor data",
      note: wastePending
        ? "No direct hardware, logistics, disposal, or vendor waste records were supplied. Treat this as a data gap, not zero waste."
        : wasteNote
    },
    nature: {
      ...IMPACT_DIMENSIONS.nature,
      level: natureLabel,
      drivers: natureDrivers,
      note: natureNote
    }
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

  const bench = computeBenchmark(a.stage, a.teamSize, a.businessModel || a.inferredBusinessModel);
  const benchmark = `Indicative peer range for ${bench.basisFte}: ~${bench.low}-${bench.high} tCO2e/yr (${BENCHMARKS.perFte.low}-${BENCHMARKS.perFte.high} ${BENCHMARKS.perFte.unit}). ${BENCHMARKS.perFte.note} Source: ${BENCHMARKS.perFte.source}.`;

  const impact = computeImpactProfile(a.snapshot || {}, activities, a.businessModel);
  const wasteText = impact.waste.pending ? impact.waste.pendingLabel : `~${impact.waste.value} kg/yr`;
  const dimensions = `Impact beyond carbon (modeled/qualitative, replace with real data): Energy ~${impact.energy.value.toLocaleString()} kWh/yr; Water ~${impact.water.value} m³/yr; Waste: ${wasteText}; Land & biodiversity materiality: ${impact.nature.level}${impact.nature.drivers.length ? ` (via ${impact.nature.drivers.join(", ")})` : ""}.`;

  const footprintTonnes = a.snapshot && a.snapshot.footprintTotal;
  const cost = footprintTonnes != null ? priceFootprint(footprintTonnes) : null;
  const costLine = cost
    ? `Potential future cost exposure (illustrative, not a bill): ~$${cost.low.toLocaleString()}-$${cost.high.toLocaleString()}/yr, pricing the modeled footprint at ${cost.lines.map(l => `${l.label} $${l.usdPerTonne}/t (${l.source})`).join(" and ")}.`
    : "Potential future cost exposure: unavailable (footprint not modeled).";

  // Filter frameworks based on isHardware
  const bmLower = String(a.businessModel || a.inferredBusinessModel || "").toLowerCase();
  const isHardware = bmLower.includes("hardware") || bmLower.includes("device") || bmLower.includes("physical");
  
  let fws = FRAMEWORKS;
  if (isHardware) {
    fws = FRAMEWORKS.filter(f => f.id !== "sci" && f.id !== "rebound");
  } else {
    fws = FRAMEWORKS.filter(f => f.id !== "iso-lca" && f.id !== "ghgp-product");
  }
  const frameworks = fws.map(f => `${f.name}: ${f.what}`);
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

export const BUSINESS_MODEL_OPTIONS = [
  { id: "saas",              label: "SaaS / Software",                       description: "Web or API product, paid seats or usage. Common for AI / climate-data plays." },
  { id: "foundation_model",  label: "Foundation Model / Heavy Compute",      description: "Training or running large AI models. Will trigger the 1000x compute multiplier automatically." },
  { id: "hardware",          label: "Hardware / Physical Product",            description: "Manufactured devices, IoT, sensors, lab equipment." },
  { id: "marketplace",       label: "Marketplace / Platform",                 description: "Connects buyers and sellers, takes a cut." },
  { id: "service",           label: "Services / Consulting",                  description: "Carbon advisory, verification, project delivery." },
  { id: "biotech_materials", label: "Biotech / Low-Carbon Materials",          description: "Alternative proteins, novel materials, biotech processes." },
  { id: "logistics",         label: "Logistics / Mobility",                    description: "Fleet, last-mile, freight, EV charging networks." },
  { id: "other",             label: "Other",                                   description: "Free-text fallback. Describe in 1-2 sentences." }
];

export const FUNDING_STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];

export const CLOUD_PROVIDERS = [
  { id: "aws",     label: "Amazon Web Services (AWS)",  note: "Major regions US-East, US-West, EU." },
  { id: "gcp",     label: "Google Cloud Platform (GCP)", note: "Carbon-neutral since 2007 (claim by provider)." },
  { id: "azure",   label: "Microsoft Azure",             note: "Carbon-negative by 2030 (provider commitment)." },
  { id: "oci",     label: "Oracle Cloud Infrastructure", note: "" },
  { id: "alibaba", label: "Alibaba Cloud / Tencent",     note: "Common for APAC operations." },
  { id: "hetzner", label: "Hetzner / OVH / Bare-metal",  note: "Often lower-carbon per kWh in EU." },
  { id: "self",    label: "Self-hosted / Colocation",    note: "On-prem or rented racks; bring your own grid mix." },
  { id: "other",   label: "Other",                        note: "Use the free-text box to specify." }
];

export const HOSTING_REGIONS = [
  { id: "us-east",      label: "United States",                note: "Grid mix varies ~0.35-0.45 kgCO2/kWh." },
  { id: "us-west",      label: "United States (West Coast)",   note: "Often cleaner grid (CA, WA hydro/wind)." },
  { id: "canada",       label: "Canada",                        note: "Hydro-heavy, ~0.13 kgCO2/kWh." },
  { id: "eu-west",      label: "Europe (Western)",              note: "Mixed; France low, Germany moderate." },
  { id: "eu-nordics",   label: "Europe (Nordics)",              note: "Very low-carbon, mostly hydro/wind." },
  { id: "uk",           label: "United Kingdom",                note: "Rapidly decarbonizing grid." },
  { id: "apac",         label: "Asia-Pacific (SG/JP/AU)",       note: "Mixed; Singapore high-carbon, Australia cleaner." },
  { id: "india",        label: "India",                         note: "Coal-heavy, ~0.7 kgCO2/kWh." },
  { id: "china",        label: "China",                         note: "Coal-heavy but rapidly adding renewables." },
  { id: "mena",         label: "Middle East / Africa",          note: "Often high-carbon grid; check local factor." },
  { id: "latam",        label: "Latin America",                 note: "Brazil ~0.08 (hydro); varies widely." },
  { id: "global",       label: "Multi-region / Don't know",     note: "Use the world-average factor as fallback." },
  { id: "other",        label: "Other",                          note: "Use the free-text box to specify." }
];

export const PRIMARY_ACTIVITIES = [
  { id: "compute_ml",    label: "Cloud / ML training & inference", note: "GPU/TPU workloads; the dominant cost for SaaS/AI." },
  { id: "manufacturing", label: "Manufacturing / assembly",         note: "Factories, contract manufacturers, hardware lines." },
  { id: "lab_research",  label: "Lab / wet-lab research",           note: "Bench scientists, consumables, fume hoods." },
  { id: "field_ops",     label: "Field operations / installations", note: "On-site deployments, technicians, vehicles." },
  { id: "software_dev",  label: "Software development",              note: "Coding, QA, dev tooling — mostly compute + laptops." },
  { id: "sales_growth",  label: "Sales / marketing / GTM",          note: "Travel-heavy, events, paid acquisition." },
  { id: "advisory",      label: "Advisory / consulting delivery",   note: "Billed hours, project work, travel to client." },
  { id: "logistics_fleet", label: "Logistics / fleet operations",   note: "Delivery, freight, last-mile." },
  { id: "other",         label: "Other",                              note: "Use the free-text box to specify." }
];

export const ENERGY_SOURCES = [
  { id: "grid_default",   label: "Standard grid (don't know)",       note: "We use the world-average grid intensity (~0.48 kgCO2/kWh)." },
  { id: "grid_clean",     label: "Clean grid (hydro / wind / solar heavy)", note: "Use the regional clean-grid factor if available." },
  { id: "grid_dirty",     label: "Coal/gas-heavy grid",              note: "Use the higher end of regional factor." },
  { id: "renewable_ppa",  label: "Renewable PPA / 100% match",        note: "Provider-claimed; we'll flag as unverified." },
  { id: "on_site_solar",  label: "On-site solar / behind-the-meter", note: "Office PV, charging from rooftop." },
  { id: "other",          label: "Other",                              note: "Use the free-text box to specify." }
];

// Per-business-model intake defaults. The IDs match the activity checkbox
// `value` attributes in the wizard. `promptHint` is shown to the founder on
// step 5 to explain which activities are highlighted and why.
export const BUSINESS_MODEL_PROFILES = {
  saas: {
    promptHint: "For SaaS, we've focused defaults on cloud spend, headcount, and any tokens you bill against. Deselect anything you don't actually run.",
    defaultActivities: ["compute", "travel", "vendors", "avoided-grid"],
    spotlight: ["compute", "vendors"]
  },
  foundation_model: {
    promptHint: "Foundation model / heavy compute: we apply a 1000x compute multiplier automatically. Cloud spend, training/inference jobs, and RLHF/Data Annotation workforce are the dominant factors.",
    defaultActivities: ["compute", "travel", "vendors", "avoided-grid"],
    spotlight: ["compute"]
  },
  hardware: {
    promptHint: "Hardware & physical product: we've defaulted to logistics, vendor spend, and the electronics footprint. Tick 'Hardware & Electronics' if you're shipping units.",
    defaultActivities: ["hardware", "travel", "vendors", "logistics", "avoided-material"],
    spotlight: ["hardware", "logistics"]
  },
  marketplace: {
    promptHint: "Marketplace / platform: vendor SaaS, FTE travel, and any logistics your listings touch are the dominant levers.",
    defaultActivities: ["compute", "travel", "vendors"],
    spotlight: ["compute", "vendors"]
  },
  service: {
    promptHint: "Services / consulting: travel, vendor SaaS, and any low-carbon advisory framing in your handprint.",
    defaultActivities: ["compute", "travel", "vendors", "avoided-grid"],
    spotlight: ["travel"]
  },
  biotech_materials: {
    promptHint: "Biotech / low-carbon materials: lab energy, hardware inputs, and the avoided-emissions claim on your alternative material are the dominant levers.",
    defaultActivities: ["hardware", "compute", "travel", "vendors", "avoided-material"],
    spotlight: ["hardware", "avoided-material"]
  },
  logistics: {
    promptHint: "Logistics / mobility: fleet fuel, last-mile, and the avoided-emissions claim vs. diesel baselines are the dominant levers.",
    defaultActivities: ["logistics", "hardware", "travel", "vendors", "avoided-transport"],
    spotlight: ["logistics", "avoided-transport"]
  },
  other: {
    promptHint: "We've left the defaults general — add or remove anything that fits your actual situation.",
    defaultActivities: ["compute", "travel", "vendors"],
    spotlight: []
  }
};

export function profileFor(modelId) {
  return BUSINESS_MODEL_PROFILES[modelId] || BUSINESS_MODEL_PROFILES.other;
}
