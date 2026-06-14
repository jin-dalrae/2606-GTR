import { describe, it, expect } from 'vitest';
import { buildReportPrompt, buildReportSchema, extractUsefulText, getClientIp, normalizePublicWebsiteUrl } from './worker/index.js';

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

describe('AI report grounding', () => {
  it('builds a prompt that uses real context and labels missing evidence', () => {
    const prompt = buildReportPrompt({
      name: 'Trottr',
      url: 'https://trottr.example',
      stage: 'Seed',
      businessModel: 'Logistics',
      teamSize: 12,
      activities: ['logistics', 'scope2-grid', 'scope1-direct'],
      notes: 'We replace diesel vans with e-cargo bikes for inner-city grocery drops.',
      docs: { deck: 'deck.pdf', accounting: 'pnl.xlsx' },
      snapshot: {
        footprintTotal: 19.1,
        uncertaintyAbs: 4.5,
        hotspots: [{ name: 'Logistics & Distribution', value: 12 }],
        breakdown: [{ name: 'Logistics & Distribution', value: 12, scope: 3, unc: 35 }],
        handprintPotential: 11.5
      }
    }, {
      asOfDate: '2026-06-13',
      websiteContext: {
        status: 'ok',
        url: 'https://trottr.example/',
        text: 'Trottr operates e-cargo-bike grocery delivery in London and Amsterdam.'
      }
    });

    expect(prompt).toContain('Current date: 2026-06-13');
    expect(prompt).toContain('Trottr operates e-cargo-bike grocery delivery');
    expect(prompt).toContain('You did not read source files');
    expect(prompt).toContain('Selected document filenames only: deck.pdf, pnl.xlsx');
    expect(prompt).toContain('if selling into EU enterprise customers');
  });

  it('normalizes public websites and rejects local/private targets', () => {
    expect(normalizePublicWebsiteUrl('example.com/path#team')).toBe('https://example.com/path');
    expect(normalizePublicWebsiteUrl('https://localhost:8787')).toBeNull();
    expect(normalizePublicWebsiteUrl('http://10.0.0.4')).toBeNull();
    expect(normalizePublicWebsiteUrl('javascript:alert(1)')).toBeNull();
  });

  it('requires a basis field so the briefing shows what context was used', () => {
    const schema = buildReportSchema();
    expect(schema.required).toContain('basis');
    expect(schema.required).toContain('executiveSummary');
    expect(schema.required).toContain('evidenceGaps');
    expect(schema.required).toContain('methodologyNotes');
    expect(schema.properties.basis.description).toContain('facts used');
  });

  it('uses a smaller preview schema before login', () => {
    const previewSchema = buildReportSchema('preview');
    expect(previewSchema.required).toEqual(['headline', 'basis', 'issues', 'regulation', 'firstAction']);
    expect(previewSchema.properties.risks).toBeUndefined();

    const previewPrompt = buildReportPrompt({ name: 'Preview Co', snapshot: {} }, { mode: 'preview', asOfDate: '2026-06-13' });
    const fullPrompt = buildReportPrompt({ name: 'Preview Co', snapshot: {} }, { mode: 'full', asOfDate: '2026-06-13' });
    expect(previewPrompt).toContain('unlocked preview half');
    expect(fullPrompt).toContain('full founder-facing report');
  });

  it('reads the Cloudflare client IP header before proxy fallbacks', () => {
    const request = new Request('https://example.com/api/generate-report', {
      headers: {
        'CF-Connecting-IP': '203.0.113.1',
        'X-Forwarded-For': '198.51.100.2, 198.51.100.3'
      }
    });
    expect(getClientIp(request)).toBe('203.0.113.1');

    const fallback = new Request('https://example.com/api/generate-report', {
      headers: { 'X-Forwarded-For': '198.51.100.2, 198.51.100.3' }
    });
    expect(getClientIp(fallback)).toBe('198.51.100.2');
  });

  it('extracts usable website text without script or style content', () => {
    const text = extractUsefulText('<title>Acme</title><style>.x{}</style><script>alert(1)</script><h1>Grid software &amp; batteries</h1>');
    expect(text).toContain('Acme');
    expect(text).toContain('Grid software & batteries');
    expect(text).not.toContain('alert');
  });
});
