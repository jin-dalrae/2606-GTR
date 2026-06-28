/* ==========================================================================
   IMPACT GRADING
   Turns a modeled snapshot into public-safe grades + bands for the share
   card. Never exposes raw tCO2e numbers — only a letter grade, relative
   bands, and the maturity level. Used by the share routes only.
   ========================================================================== */

export function footprintBand(footprintTotal, benchmark) {
  const low = Number(benchmark && benchmark.low) || 0;
  const high = Number(benchmark && benchmark.high) || 0;
  const fp = Number(footprintTotal) || 0;
  if (high <= 0) return "unknown";
  if (fp < low) return "below";
  if (fp > high) return "above";
  return "at";
}

export function handprintStatus(handprintPotential) {
  return (Number(handprintPotential) || 0) > 0 ? "positive" : "building";
}

// A-F impact grade from footprint position vs peers + handprint presence.
// below-median + positive handprint = A; way-above + no handprint = F.
export function impactGrade(band, handprint) {
  const hasHandprint = handprint === "positive";
  if (band === "below") return hasHandprint ? "A" : "B";
  if (band === "at") return hasHandprint ? "B" : "C";
  if (band === "above") return hasHandprint ? "C" : "D";
  return hasHandprint ? "C" : "D";
}

const BAND_LABEL = {
  below: "Below peer median",
  at: "At peer median",
  above: "Above peer median",
  unknown: "Peer range unavailable"
};

const HANDPRINT_LABEL = {
  positive: "Positive — avoiding emissions at scale",
  building: "Building — handprint not yet modeled"
};

const GRADE_HEADLINE = {
  A: "Strong climate position",
  B: "Solid climate position",
  C: "Room to improve",
  D: "Early days",
  F: "Just getting started"
};

export function computeGrades(assessment) {
  const snapshot = (assessment && assessment.snapshot) || {};
  const benchmark = (assessment && assessment.benchmark) || {};
  const band = footprintBand(snapshot.footprintTotal, benchmark);
  const handprint = handprintStatus(snapshot.handprintPotential);
  const grade = impactGrade(band, handprint);
  const maturityLevel = Math.max(1, Math.min(5, Number(assessment && assessment.maturityLevel) || 1));
  return {
    companyName: String((assessment && assessment.name) || "A climate startup").slice(0, 80),
    stage: String((assessment && assessment.stage) || "").slice(0, 40),
    impactGrade: grade,
    gradeHeadline: GRADE_HEADLINE[grade] || GRADE_HEADLINE.C,
    footprintBand: band,
    footprintBandLabel: BAND_LABEL[band],
    handprintStatus: handprint,
    handprintLabel: HANDPRINT_LABEL[handprint],
    maturityLevel,
    maturityLabel: `Level ${maturityLevel} of 5`
  };
}
