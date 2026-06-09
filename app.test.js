import { describe, it, expect } from 'vitest';

// Calculation helper extracted to verify mathematics logic independently
function calculateLedgerTotals(state) {
  let footprintTotal = 0;
  let handprintTotal = 0;
  
  let footprintUncertaintySumSq = 0;
  let handprintUncertaintySumSq = 0;
  
  state.metrics.forEach(m => {
    footprintTotal += m.value;
    const uncAbs = m.value * (m.uncertainty / 100);
    footprintUncertaintySumSq += Math.pow(uncAbs, 2);
  });
  
  state.claims.forEach(c => {
    // Invariant check: claim must NOT be None additionality, and status must be active
    if (c.additionality_status !== "None" && c.status === "active") {
      handprintTotal += c.value;
      const uncAbs = c.value * (c.uncertainty / 100);
      handprintUncertaintySumSq += Math.pow(uncAbs, 2);
    }
  });
  
  const footprintUncertaintyAbs = Math.sqrt(footprintUncertaintySumSq);
  const handprintUncertaintyAbs = Math.sqrt(handprintUncertaintySumSq);
  const netUncertaintyAbs = Math.sqrt(footprintUncertaintySumSq + handprintUncertaintySumSq);
  
  return {
    footprintTotal,
    handprintTotal,
    footprintUncertaintyAbs,
    handprintUncertaintyAbs,
    netUncertaintyAbs
  };
}

// Maturity Scoring helper
function calculateMaturityLevel(state) {
  let level = 0;
  
  const l1 = state.company.isInitialized;
  if (l1) level = 1;
  
  const l2 = l1 && state.claims.length > 0;
  if (l2) level = 2;
  
  const l3 = l2 && state.metrics.some(m => m.source_type === "metered");
  if (l3) level = 3;
  
  const l4 = l3 && state.goals.filter(g => g.owner_id).length >= 3;
  if (l4) level = 4;
  
  const l5 = l4 && state.goals.filter(g => g.status === "Complete" && g.evidence.length > 0).length >= 2;
  if (l5) level = 5;
  
  return level;
}

describe('Climate Startup +/- Impact Dashboard Mathematics', () => {
  
  it('should calculate correct totals for footprints', () => {
    const mockState = {
      metrics: [
        { id: "compute", value: 10.0, uncertainty: 20 }, // absolute unc = 2.0
        { id: "travel", value: 5.0, uncertainty: 10 }    // absolute unc = 0.5
      ],
      claims: []
    };
    
    const result = calculateLedgerTotals(mockState);
    expect(result.footprintTotal).toBe(15.0);
    
    // sqrt(2.0^2 + 0.5^2) = sqrt(4.0 + 0.25) = sqrt(4.25) ≈ 2.06
    expect(result.footprintUncertaintyAbs).toBeCloseTo(2.06, 2);
    expect(result.handprintTotal).toBe(0.0);
  });

  it('should gate handprint claims and set value to 0 if additionality is None (would have happened anyway)', () => {
    const mockState = {
      metrics: [],
      claims: [
        { id: "claim-1", value: 100.0, uncertainty: 10, additionality_status: "Strong", status: "active" },
        { id: "claim-2", value: 50.0, uncertainty: 20, additionality_status: "None", status: "flagged" } // gated out
      ]
    };
    
    const result = calculateLedgerTotals(mockState);
    expect(result.handprintTotal).toBe(100.0); // claim-2 is ignored because additionality_status is "None"
    expect(result.handprintUncertaintyAbs).toBeCloseTo(10.0, 2); // only claim-1 propagates
  });

  it('should correctly propagate combined net uncertainty', () => {
    const mockState = {
      metrics: [
        { id: "compute", value: 10.0, uncertainty: 20 } // abs unc = 2.0
      ],
      claims: [
        { id: "claim-1", value: 50.0, uncertainty: 10, additionality_status: "Strong", status: "active" } // abs unc = 5.0
      ]
    };
    
    const result = calculateLedgerTotals(mockState);
    // net uncertainty = sqrt(2.0^2 + 5.0^2) = sqrt(4 + 25) = sqrt(29) ≈ 5.385
    expect(result.netUncertaintyAbs).toBeCloseTo(5.385, 2);
  });

  it('should dynamically score maturity levels based on user milestones', () => {
    const state = {
      company: { isInitialized: false },
      claims: [],
      metrics: [],
      goals: []
    };
    
    // Level 0: Unmapped
    expect(calculateMaturityLevel(state)).toBe(0);
    
    // Level 1: Mapped
    state.company.isInitialized = true;
    expect(calculateMaturityLevel(state)).toBe(1);
    
    // Level 2: Gated
    state.claims.push({ id: "c1", additionality_status: "Strong", status: "active" });
    expect(calculateMaturityLevel(state)).toBe(2);
    
    // Level 3: Metered
    state.metrics.push({ id: "m1", source_type: "modeled" });
    expect(calculateMaturityLevel(state)).toBe(2); // still 2 because no metered sources
    state.metrics.push({ id: "m2", source_type: "metered" });
    expect(calculateMaturityLevel(state)).toBe(3);
    
    // Level 4: Active
    state.goals.push({ id: "g1", owner_id: "rae", status: "Not Started", evidence: [] });
    state.goals.push({ id: "g2", owner_id: "sam", status: "Not Started", evidence: [] });
    expect(calculateMaturityLevel(state)).toBe(3); // still 3, needs 3 active goals with owners
    state.goals.push({ id: "g3", owner_id: "dev", status: "Not Started", evidence: [] });
    expect(calculateMaturityLevel(state)).toBe(4);
    
    // Level 5: Improved
    state.goals[0].status = "Complete";
    state.goals[0].evidence.push({ id: "ev1" });
    expect(calculateMaturityLevel(state)).toBe(4); // still 4, needs at least 2 completed goals with evidence
    state.goals[1].status = "Complete";
    state.goals[1].evidence.push({ id: "ev2" });
    expect(calculateMaturityLevel(state)).toBe(5);
  });

});
