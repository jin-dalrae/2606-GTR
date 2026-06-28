/* ==========================================================================
   ASSESSMENT SNAPSHOT MATH
   Ported from app.js (client-side) so the Worker can compute a footprint
   snapshot from raw inputs — used by both /api/compute-snapshot and the
   MCP server tools. Keep this file in sync with the original logic in
   app.js::computeSnapshot.
   ========================================================================== */

export const ACTIVITIES_DB = {
  "compute":          { id: "compute",          name: "Cloud & AI Compute",         scope: 3,        defaultVal: 8.5,  unit: "tCO2e/yr", defaultUnc: 30, type: "modeled", description: "Cloud, AI training/inference, and SaaS hosting. Largest modeled line for most SaaS / AI startups." },
  "hardware":         { id: "hardware",         name: "Hardware & Electronics",     scope: 3,        defaultVal: 3.2,  unit: "tCO2e/yr", defaultUnc: 40, type: "modeled", description: "Laptops, phones, lab equipment, on-prem servers." },
  "travel":           { id: "travel",           name: "FTE Travel & Commutes",      scope: 3,        defaultVal: 4.8,  unit: "tCO2e/yr", defaultUnc: 25, type: "modeled", description: "Business travel and employee commuting. Driven by team size and travel intensity." },
  "vendors":          { id: "vendors",          name: "Key Vendors & SaaS",         scope: 3,        defaultVal: 2.1,  unit: "tCO2e/yr", defaultUnc: 50, type: "modeled", description: "High-spend SaaS, professional services, and key third-party vendors." },
  "logistics":        { id: "logistics",        name: "Logistics & Distribution",   scope: 3,        defaultVal: 12.0, unit: "tCO2e/yr", defaultUnc: 35, type: "modeled", description: "Inbound + outbound freight, last-mile delivery, warehousing." },
  "scope2-grid":      { id: "scope2-grid",      name: "Purchased Electricity (Scope 2)", scope: 2,   defaultVal: 5.6,  unit: "tCO2e/yr", defaultUnc: 15, type: "modeled", description: "Grid electricity for office / lab space. Always included by default." },
  "scope1-direct":    { id: "scope1-direct",    name: "Direct Emissions (Scope 1)", scope: 1,        defaultVal: 1.5,  unit: "tCO2e/yr", defaultUnc: 20, type: "modeled", description: "On-site combustion, refrigerant leaks, owned vehicles. Always included by default." },
  "avoided-grid":     { id: "avoided-grid",     name: "Grid Decarbonization",       scope: "avoided", defaultVal: 0,    unit: "tCO2e/yr", defaultUnc: 0,  type: "modeled", description: "Drives the handprint when your product accelerates grid decarbonization." },
  "avoided-transport":{ id: "avoided-transport",name: "Transport Avoidance",        scope: "avoided", defaultVal: 0,    unit: "tCO2e/yr", defaultUnc: 0,  type: "modeled", description: "Displaces fossil transport — remote work, EV fleets, route optimization." },
  "avoided-material": { id: "avoided-material", name: "Low-Carbon Materials",       scope: "avoided", defaultVal: 0,    unit: "tCO2e/yr", defaultUnc: 0,  type: "modeled", description: "Substitutes high-carbon materials (cement, steel, plastics) with lower-carbon alternatives." }
};

export const DEFAULT_MODEL_TEAM_SIZE = 10;

export const ACTIVITY_SCOPE_LABELS = {
  "compute":       "Scope 3, Category 1 (Purchased Goods and Services)",
  "hardware":      "Scope 3, Category 2 (Capital Goods)",
  "travel":        "Scope 3, Category 6 (Business Travel) & Category 7 (Employee Commuting)",
  "vendors":       "Scope 3, Category 1 (Purchased Goods and Services)",
  "logistics":     "Scope 3, Category 4 & 9 (Transportation and Distribution)",
  "scope2-grid":   "Scope 2 \u00b7 Purchased electricity",
  "scope1-direct": "Scope 1 \u00b7 Direct emissions"
};

export function teamScaleFactor(teamSize) {
  const fte = Number(teamSize);
  return fte > 0 ? fte / DEFAULT_MODEL_TEAM_SIZE : 1;
}

// Build a modeled footprint snapshot from activity defaults + team size.
// Footprint always includes scope2-grid and scope1-direct by default; caller
// can override the activity list. Returns the same shape the SPA expects.
export function computeSnapshot(activities, teamSize = 0) {
  const requested = Array.isArray(activities) && activities.length
    ? [...activities]
    : Object.keys(ACTIVITIES_DB);
  if (!requested.includes("scope2-grid")) requested.push("scope2-grid");
  if (!requested.includes("scope1-direct")) requested.push("scope1-direct");
  const unique = [...new Set(requested)];

  const footprintItems = [];
  let footprintTotal = 0;
  let uncSumSq = 0;
  const scaleFactor = teamScaleFactor(teamSize);

  unique.forEach((key) => {
    const db = ACTIVITIES_DB[key];
    if (!db) return;
    if (db.scope === "avoided") return;
    const value = db.defaultVal * scaleFactor;
    footprintTotal += value;
    const uncAbs = value * (db.defaultUnc / 100);
    uncSumSq += Math.pow(uncAbs, 2);
    footprintItems.push({
      id: key,
      name: db.name,
      value,
      baseValue: db.defaultVal,
      unc: db.defaultUnc,
      scope: db.scope,
      scopeLabel: ACTIVITY_SCOPE_LABELS[key] || `Scope ${db.scope}`
    });
  });

  const hotspots = [...footprintItems].sort((a, b) => b.value - a.value).slice(0, 3);
  const maxVal = hotspots.length ? hotspots[0].value : 1;

  const avoidedCount = unique.filter((k) => ACTIVITIES_DB[k] && ACTIVITIES_DB[k].scope === "avoided").length;
  const handprintPotential = avoidedCount * Math.max(footprintTotal * 0.6, 10);

  return {
    footprintTotal,
    uncertaintyAbs: Math.sqrt(uncSumSq),
    hotspots: hotspots.map((h) => ({ ...h, pct: Math.round((h.value / maxVal) * 100) })),
    breakdown: footprintItems.sort((a, b) => b.value - a.value),
    handprintPotential,
    scaleFactor,
    scalingBasis: teamSize > 0
      ? `Scaled from a ${DEFAULT_MODEL_TEAM_SIZE}-FTE default model to ${teamSize.toLocaleString()} FTEs.`
      : `Using the ${DEFAULT_MODEL_TEAM_SIZE}-FTE default model because team size was not supplied.`
  };
}

// Return a list of activity keys + display info for tool UIs and listings.
export function listActivities() {
  return Object.values(ACTIVITIES_DB).map((a) => ({
    id: a.id,
    name: a.name,
    scope: a.scope,
    defaultVal: a.defaultVal,
    defaultUnc: a.defaultUnc,
    unit: a.unit,
    type: a.type,
    description: a.description
  }));
}
