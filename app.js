/* ==========================================================================
   APPLICATION LOGIC - CLIMATE IMPACT DASHBOARD (MVP)
   ========================================================================== */

// Default State Configuration
const DEFAULT_STATE = {
  company: {
    name: "",
    url: "",
    stage: "",
    businessModel: "",
    teamSize: 0,
    activities: [],
    materiality: [],
    isInitialized: false,
    scalingReference: "Climate Brick Stage Reference"
  },
  members: [
    { id: "rae", name: "Rae Jin", role: "Founder / CEO" },
    { id: "sam", name: "Sam Green", role: "Head of Operations" },
    { id: "vc_analyst", name: "Partner (Carbon Capital)", role: "Lead Advisor" }
  ],
  metrics: [],
  claims: [],
  goals: [],
  streak: {
    count: 1,
    lastUpdate: new Date().toISOString()
  },
  maturityLevel: 0,
  evidencePoints: 0,
  evidenceLogs: []
};

// Activity Database Definitions
const ACTIVITIES_DB = {
  "compute": { id: "compute", name: "Cloud & AI Compute", scope: 3, defaultVal: 8.5, unit: "tCO2e/yr", defaultUnc: 30, type: "modeled" },
  "hardware": { id: "hardware", name: "Hardware & Electronics", scope: 3, defaultVal: 3.2, unit: "tCO2e/yr", defaultUnc: 40, type: "modeled" },
  "travel": { id: "travel", name: "FTE Travel & Commutes", scope: 3, defaultVal: 4.8, unit: "tCO2e/yr", defaultUnc: 25, type: "modeled" },
  "vendors": { id: "vendors", name: "Key Vendors & SaaS", scope: 3, defaultVal: 2.1, unit: "tCO2e/yr", defaultUnc: 50, type: "modeled" },
  "logistics": { id: "logistics", name: "Logistics & Distribution", scope: 3, defaultVal: 12.0, unit: "tCO2e/yr", defaultUnc: 35, type: "modeled" },
  "scope2-grid": { id: "scope2-grid", name: "Purchased Electricity (Scope 2)", scope: 2, defaultVal: 5.6, unit: "tCO2e/yr", defaultUnc: 15, type: "modeled" },
  "scope1-direct": { id: "scope1-direct", name: "Direct Emissions (Scope 1)", scope: 1, defaultVal: 1.5, unit: "tCO2e/yr", defaultUnc: 20, type: "modeled" },
  
  "avoided-grid": { id: "avoided-grid", name: "Grid Decarbonization", scope: "avoided", defaultVal: 0, unit: "tCO2e/yr", defaultUnc: 0, type: "modeled" },
  "avoided-transport": { id: "avoided-transport", name: "Transport Avoidance", scope: "avoided", defaultVal: 0, unit: "tCO2e/yr", defaultUnc: 0, type: "modeled" },
  "avoided-material": { id: "avoided-material", name: "Low-Carbon Materials", scope: "avoided", defaultVal: 0, unit: "tCO2e/yr", defaultUnc: 0, type: "modeled" }
};

// Recommended Goals based on selected activities
const GOAL_TEMPLATES = {
  "compute": { title: "Implement SCI Method for Cloud/AI Compute", activity: "compute" },
  "hardware": { title: "Source 100% refurbished laptops & hardware", activity: "hardware" },
  "travel": { title: "Cap corporate flights to 1.5t CO2e/FTE/yr", activity: "travel" },
  "vendors": { title: "Audit high-cost SaaS providers' net-zero commitments", activity: "vendors" },
  "logistics": { title: "Contract exclusively with logistics firms utilizing EV fleets", activity: "logistics" },
  "avoided-grid": { title: "Perform Hourly Marginal Emissions Matching (WattTime MOER)", activity: "avoided-grid" },
  "avoided-transport": { title: "Validate transport avoidance counterfactual baseline with VC", activity: "avoided-transport" },
  "avoided-material": { title: "Acquire third-party Lifecycle Assessment (LCA) for key material", activity: "avoided-material" }
};

class ClimateDashboardApp {
  constructor() {
    this.state = this.loadState();
    this.currentView = "intake";
    this.wattTimeIntensity = 432; // base simulated intensity
    
    // Bind DOM events
    this.initDOM();
    this.initRouter();
    this.initWattTimeSimulator();
    
    // Render initial state
    this.render();
  }

  // State Persistence
  loadState() {
    const data = localStorage.getItem("climate_dashboard_state");
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Failed parsing localStorage state. Initializing fresh.", e);
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    localStorage.setItem("climate_dashboard_state", JSON.stringify(this.state));
    this.render();
  }

  // WattTime Grid Simulation
  initWattTimeSimulator() {
    const updateIntensity = () => {
      // Fluctuate carbon intensity around a base
      const drift = Math.sin(Date.now() / 15000) * 45;
      const noise = (Math.random() - 0.5) * 15;
      this.wattTimeIntensity = Math.round(410 + drift + noise);
      
      const el = document.getElementById("live-grid-intensity");
      if (el) {
        el.innerText = `${this.wattTimeIntensity} lbs/MWh`;
      }
      
      // Update Scope 2 grid electricity factor dynamically if metered
      const scope2 = this.state.metrics.find(m => m.id === "scope2-grid");
      if (scope2 && scope2.source_type === "metered") {
        // Mock a real-time adjustment: value is calculated by active grid intensity scale
        const calculatedVal = (this.wattTimeIntensity / 500) * 5.6; // baseline intensity scale
        scope2.value = parseFloat(calculatedVal.toFixed(2));
        scope2.measured_at = new Date().toISOString();
        // Saving state silently prevents active view refresh loops
        localStorage.setItem("climate_dashboard_state", JSON.stringify(this.state));
        this.updateTotalsUIOnly();
      }
    };
    
    updateIntensity();
    setInterval(updateIntensity, 3500);
  }

  // Inline totals update to prevent DOM recreation during inputs
  updateTotalsUIOnly() {
    const totals = this.calculateTotals();
    
    const ftEl = document.getElementById("footprint-total");
    if (ftEl) ftEl.innerText = `${totals.footprintTotal.toFixed(1)} tCO2e/yr`;
    
    const htEl = document.getElementById("handprint-total");
    if (htEl) htEl.innerText = `${totals.handprintTotal.toFixed(1)} tCO2e/yr`;
    
    const netValEl = document.getElementById("ledger-net-value");
    if (netValEl) {
      const netVal = totals.footprintTotal - totals.handprintTotal;
      const netSign = netVal > 0 ? "+" : "";
      netValEl.innerText = `${netSign}${netVal.toFixed(1)} tCO2e/yr`;
    }
    
    const netUncEl = document.getElementById("ledger-net-uncertainty");
    if (netUncEl) {
      netUncEl.innerText = `Propagated Uncertainty Range: ±${totals.netUncertaintyAbs.toFixed(1)} tCO2e`;
    }
  }

  // Routing
  initRouter() {
    const handleRoute = () => {
      const hash = window.location.hash.replace("#", "") || "intake";
      
      // Force intake if not initialized
      if (!this.state.company.isInitialized && hash !== "intake") {
        window.location.hash = "#intake";
        return;
      }
      
      this.currentView = hash;
      
      // Update sidebar highlight
      document.querySelectorAll(".nav-link").forEach(link => {
        if (link.dataset.view === hash) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
      
      // Toggle views
      document.querySelectorAll(".app-view").forEach(view => {
        if (view.id === `view-${hash}`) {
          view.classList.add("active");
        } else {
          view.classList.remove("active");
        }
      });
      
      this.renderViewSpecifics(hash);
    };
    
    window.addEventListener("hashchange", handleRoute);
    // Initial trigger
    setTimeout(handleRoute, 100);
  }

  // DOM Events and bindings
  initDOM() {
    // 1. Wizard Buttons
    document.getElementById("btn-next-to-2").addEventListener("click", () => {
      document.getElementById("step-1").classList.add("hidden");
      document.getElementById("step-2").classList.remove("hidden");
      document.getElementById("indicator-step-1").classList.remove("active");
      document.getElementById("indicator-step-2").classList.add("active");
    });
    
    document.getElementById("btn-back-to-1").addEventListener("click", () => {
      document.getElementById("step-2").classList.add("hidden");
      document.getElementById("step-1").classList.remove("hidden");
      document.getElementById("indicator-step-2").classList.remove("active");
      document.getElementById("indicator-step-1").classList.add("active");
    });
    
    document.getElementById("btn-next-to-3").addEventListener("click", () => {
      this.buildMaterialityRankingUI();
      document.getElementById("step-2").classList.add("hidden");
      document.getElementById("step-3").classList.remove("hidden");
      document.getElementById("indicator-step-2").classList.remove("active");
      document.getElementById("indicator-step-3").classList.add("active");
    });
    
    document.getElementById("btn-back-to-2").addEventListener("click", () => {
      document.getElementById("step-3").classList.add("hidden");
      document.getElementById("step-2").classList.remove("hidden");
      document.getElementById("indicator-step-3").classList.remove("active");
      document.getElementById("indicator-step-2").classList.add("active");
    });
    
    // Wizard Form submit
    document.getElementById("intake-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.completeIntake();
    });

    // 2. Ledger - Add inline metric estimation
    document.getElementById("form-update-metric").addEventListener("submit", (e) => {
      e.preventDefault();
      this.updateMetricInline();
    });

    // 3. Claims Modal Controls
    const claimModal = document.getElementById("dialog-claim");
    document.getElementById("btn-trigger-claim-modal").addEventListener("click", () => {
      document.getElementById("form-claim-gate").reset();
      document.getElementById("additionality-warning-text").classList.add("hidden");
      claimModal.showModal();
    });
    document.getElementById("btn-close-claim-modal").addEventListener("click", () => claimModal.close());
    document.getElementById("btn-cancel-claim").addEventListener("click", () => claimModal.close());
    
    // Light dismissal support for modals (outside content box click)
    [claimModal, document.getElementById("dialog-evidence")].forEach(modal => {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        modal.addEventListener('click', (e) => {
          if (e.target !== modal) return;
          const rect = modal.getBoundingClientRect();
          const inside = (
            rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX && e.clientX <= rect.left + rect.width
          );
          if (!inside) modal.close();
        });
      }
    });

    // Additionality state changed warning
    document.getElementById("claim-additionality").addEventListener("change", (e) => {
      const warnText = document.getElementById("additionality-warning-text");
      if (e.target.value === "None") {
        warnText.classList.remove("hidden");
      } else {
        warnText.classList.add("hidden");
      }
    });

    // Gated Claim Form Submit
    document.getElementById("form-claim-gate").addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitGatedClaim();
    });

    // 4. Custom Goal Form
    document.getElementById("form-create-goal").addEventListener("submit", (e) => {
      e.preventDefault();
      this.addCustomGoal();
    });

    // 5. Evidence Modal Controls
    const evidenceModal = document.getElementById("dialog-evidence");
    document.getElementById("btn-close-evidence-modal").addEventListener("click", () => evidenceModal.close());
    document.getElementById("btn-cancel-evidence").addEventListener("click", () => evidenceModal.close());
    document.getElementById("form-evidence").addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitEvidence();
    });

    // 6. Game Center simulator button
    document.getElementById("btn-simulate-week-update").addEventListener("click", () => {
      this.simulateWeeklyActivity();
    });

    // 7. Share View Toggles
    document.getElementById("btn-toggle-internal").addEventListener("click", () => {
      this.toggleAudienceView(false);
    });
    document.getElementById("btn-toggle-external").addEventListener("click", () => {
      this.toggleAudienceView(true);
    });
  }

  // Intake Logic
  buildMaterialityRankingUI() {
    const listContainer = document.getElementById("materiality-rank-list");
    listContainer.innerHTML = "";
    
    // Find all checked activities
    const selectedKeys = [];
    document.querySelectorAll(".activity-checkbox-grid input[type='checkbox']").forEach(cb => {
      if (cb.checked) selectedKeys.push(cb.value);
    });
    
    // Always include electricity scope 2 and direct scope 1
    selectedKeys.push("scope2-grid");
    selectedKeys.push("scope1-direct");
    
    const uniqueKeys = [...new Set(selectedKeys)];
    
    uniqueKeys.forEach((key, index) => {
      const dbEntry = ACTIVITIES_DB[key];
      if (!dbEntry) return;
      
      const row = document.createElement("div");
      row.className = "ranking-item";
      row.dataset.key = key;
      row.innerHTML = `
        <div class="ranking-item-left">
          <div class="ranking-number">${index + 1}</div>
          <div>
            <strong>${dbEntry.name}</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">
              Scope: ${dbEntry.scope}
            </span>
          </div>
        </div>
        <div class="ranking-controls">
          <button type="button" class="btn-rank-up" data-idx="${index}">&uarr;</button>
          <button type="button" class="btn-rank-down" data-idx="${index}">&darr;</button>
        </div>
      `;
      listContainer.appendChild(row);
    });
    
    // Bind rank up/down clicks
    listContainer.querySelectorAll(".btn-rank-up").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(btn.dataset.idx);
        this.swapRanking(idx, idx - 1);
      });
    });
    
    listContainer.querySelectorAll(".btn-rank-down").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(btn.dataset.idx);
        this.swapRanking(idx, idx + 1);
      });
    });
  }

  swapRanking(idxA, idxB) {
    const items = Array.from(document.getElementById("materiality-rank-list").children);
    if (idxA < 0 || idxA >= items.length || idxB < 0 || idxB >= items.length) return;
    
    // Swap elements in the DOM visually
    const container = document.getElementById("materiality-rank-list");
    const itemA = items[idxA];
    const itemB = items[idxB];
    
    if (idxA < idxB) {
      container.insertBefore(itemB, itemA);
    } else {
      container.insertBefore(itemA, itemB);
    }
    
    // Re-index ranks
    this.reIndexRanks();
  }

  reIndexRanks() {
    const items = Array.from(document.getElementById("materiality-rank-list").children);
    items.forEach((item, index) => {
      item.querySelector(".ranking-number").innerText = index + 1;
      item.querySelectorAll(".btn-rank-up").forEach(b => b.dataset.idx = index);
      item.querySelectorAll(".btn-rank-down").forEach(b => b.dataset.idx = index);
    });
  }

  completeIntake() {
    const cName = document.getElementById("company-name").value.trim();
    const cUrl = document.getElementById("company-url").value.trim();
    const cStage = document.getElementById("company-stage").value;
    const cModel = document.getElementById("business-model").value;
    const cTeam = parseInt(document.getElementById("team-size").value) || 0;
    
    // Get activities listed in rank order
    const rankingItems = Array.from(document.getElementById("materiality-rank-list").children);
    const materiality = rankingItems.map(item => item.dataset.key);
    
    // All active checkboxes
    const activities = [];
    document.querySelectorAll(".activity-checkbox-grid input[type='checkbox']").forEach(cb => {
      if (cb.checked) activities.push(cb.value);
    });
    activities.push("scope2-grid");
    activities.push("scope1-direct");
    
    this.state.company = {
      name: cName,
      url: cUrl,
      stage: cStage,
      businessModel: cModel,
      teamSize: cTeam,
      activities: [...new Set(activities)],
      materiality: materiality,
      isInitialized: true,
      scalingReference: `Climate Brick Reference: ${cStage === 'Pre-seed' || cStage === 'Seed' ? 'Brick #1 - Seed Scaling' : 'Brick #2 - Series A Acceleration'}`
    };
    
    // Setup default metrics based on checked activities
    this.state.metrics = [];
    this.state.company.activities.forEach(actKey => {
      const dbEntry = ACTIVITIES_DB[actKey];
      if (dbEntry && dbEntry.scope !== "avoided") {
        this.state.metrics.push({
          id: dbEntry.id,
          name: dbEntry.name,
          scope: dbEntry.scope,
          value: dbEntry.defaultVal,
          unit: dbEntry.unit,
          cadence: "annual",
          source_type: dbEntry.type,
          measured_at: new Date().toISOString(),
          uncertainty: dbEntry.defaultUnc
        });
      }
    });

    // Populate default goals from Templates
    this.state.goals = [];
    this.state.company.activities.forEach(actKey => {
      const template = GOAL_TEMPLATES[actKey];
      if (template) {
        this.state.goals.push({
          id: `goal-${actKey}`,
          title: template.title,
          owner_id: "rae", // default to founder
          status: "Not Started",
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +90 days
          level: "company-wide",
          evidence: []
        });
      }
    });
    
    // Trigger streak starting point
    this.state.streak.count = 1;
    this.state.streak.lastUpdate = new Date().toISOString();
    
    // Level up maturity check
    this.updateMaturityLevel();
    
    // Save
    this.saveState();
    
    // Go to ledger
    window.location.hash = "#ledger";
  }

  // Metric Editing
  updateMetricInline() {
    const mId = document.getElementById("metric-select-name").value;
    const mVal = parseFloat(document.getElementById("metric-input-value").value);
    const mUnit = document.getElementById("metric-input-unit").value;
    const mType = document.getElementById("metric-input-type").value;
    const mUnc = parseInt(document.getElementById("metric-input-uncertainty").value) || 0;
    
    const metric = this.state.metrics.find(m => m.id === mId);
    if (metric) {
      metric.value = mVal;
      metric.unit = mUnit;
      metric.source_type = mType;
      metric.uncertainty = mUnc;
      metric.measured_at = new Date().toISOString();
      metric.cadence = mType === "metered" ? "monthly" : "annual";
      
      this.updateMaturityLevel();
      this.saveState();
      
      // Reset inline inputs
      document.getElementById("metric-input-value").value = "";
      document.getElementById("metric-input-uncertainty").value = "";
    }
  }

  // Gated Claim Submitting
  submitGatedClaim() {
    const title = document.getElementById("claim-name").value.trim();
    const val = parseFloat(document.getElementById("claim-value").value);
    const unc = parseInt(document.getElementById("claim-uncertainty").value) || 0;
    const baseline = document.getElementById("claim-baseline").value.trim();
    const displacement = document.getElementById("claim-displacement").value.trim();
    const additionality = document.getElementById("claim-additionality").value;
    const signal = document.querySelector('input[name="grid-signal"]:checked').value;
    const rebound = document.getElementById("claim-rebound").value.trim();
    
    const isFlagged = additionality === "None";
    
    const newClaim = {
      id: `claim-${Date.now()}`,
      name: title,
      value: val,
      unit: "tCO2e/yr",
      uncertainty: unc,
      baseline: baseline,
      displacement: displacement,
      additionality_status: additionality,
      marginal_signal: signal === "marginal",
      rebound: rebound,
      status: isFlagged ? "flagged" : "active",
      published_at: new Date().toISOString()
    };
    
    this.state.claims.push(newClaim);
    
    this.updateMaturityLevel();
    this.saveState();
    
    // Close modal
    document.getElementById("dialog-claim").close();
  }

  // Custom Goal Adding
  addCustomGoal() {
    const title = document.getElementById("goal-title").value.trim();
    const owner = document.getElementById("goal-owner").value;
    const deadline = document.getElementById("goal-deadline").value;
    
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: title,
      owner_id: owner,
      status: "Not Started",
      deadline: deadline,
      level: "custom",
      evidence: []
    };
    
    this.state.goals.push(newGoal);
    this.updateMaturityLevel();
    this.saveState();
    
    document.getElementById("goal-title").value = "";
    document.getElementById("goal-deadline").value = "";
  }

  // Evidence Adding
  triggerEvidenceModal(refId, refType) {
    document.getElementById("evidence-ref-id").value = refId;
    document.getElementById("evidence-ref-type").value = refType;
    document.getElementById("form-evidence").reset();
    document.getElementById("dialog-evidence").showModal();
  }

  submitEvidence() {
    const refId = document.getElementById("evidence-ref-id").value;
    const refType = document.getElementById("evidence-ref-type").value;
    const eType = document.getElementById("evidence-type").value;
    const eRef = document.getElementById("evidence-ref").value.trim();
    const eNote = document.getElementById("evidence-note").value.trim();
    
    const evidenceObj = {
      id: `evidence-${Date.now()}`,
      type: eType,
      ref: eRef,
      note: eNote,
      verified_at: new Date().toISOString()
    };
    
    if (refType === "goal") {
      const goal = this.state.goals.find(g => g.id === refId);
      if (goal) {
        goal.evidence.push(evidenceObj);
        // Award points
        this.addEvidencePoints(10, `Attached evidence link for goal: "${goal.title}"`);
      }
    } else if (refType === "claim") {
      const claim = this.state.claims.find(c => c.id === refId);
      if (claim) {
        if (!claim.evidence) claim.evidence = [];
        claim.evidence.push(evidenceObj);
        this.addEvidencePoints(10, `Attached counterfactual verification for claim: "${claim.name}"`);
      }
    }
    
    this.updateMaturityLevel();
    this.saveState();
    
    document.getElementById("dialog-evidence").close();
  }

  addEvidencePoints(pts, msg) {
    this.state.evidencePoints += pts;
    this.state.evidenceLogs.unshift({
      date: new Date().toISOString(),
      text: msg,
      points: pts
    });
  }

  // Streaks Simulation
  simulateWeeklyActivity() {
    this.state.streak.count += 1;
    this.state.streak.lastUpdate = new Date().toISOString();
    
    // Add point for streak
    this.addEvidencePoints(5, `Maintained team weekly activity streak: Week ${this.state.streak.count}`);
    
    this.updateMaturityLevel();
    this.saveState();
  }

  // Gamification Maturity Score calculation
  updateMaturityLevel() {
    let level = 0;
    
    // L1: Intake complete
    const l1 = this.state.company.isInitialized;
    if (l1) level = 1;
    
    // L2: Has gated claims with additionality check answered
    const l2 = l1 && this.state.claims.length > 0;
    if (l2) level = 2;
    
    // L3: At least one metered footprint source
    const l3 = l2 && this.state.metrics.some(m => m.source_type === "metered");
    if (l3) level = 3;
    
    // L4: At least 3 active goals with owners
    const l4 = l3 && this.state.goals.filter(g => g.owner_id).length >= 3;
    if (l4) level = 4;
    
    // L5: At least 2 goals marked Complete with evidence attached
    const l5 = l4 && this.state.goals.filter(g => g.status === "Complete" && g.evidence.length > 0).length >= 2;
    if (l5) level = 5;
    
    this.state.maturityLevel = level;
  }

  // Calculation Engine
  calculateTotals() {
    let footprintTotal = 0;
    let handprintTotal = 0;
    
    // Propagated uncertainties (Absolute)
    let footprintUncertaintySumSq = 0;
    let handprintUncertaintySumSq = 0;
    
    // Footprint
    this.state.metrics.forEach(m => {
      footprintTotal += m.value;
      const uncAbs = m.value * (m.uncertainty / 100);
      footprintUncertaintySumSq += Math.pow(uncAbs, 2);
    });
    
    // Handprint (Additionality Gated Invariant)
    this.state.claims.forEach(c => {
      // GATED INVARIANT: if additionality is None (would have happened anyway), count as 0
      if (c.additionality_status !== "None" && c.status === "active") {
        handprintTotal += c.value;
        const uncAbs = c.value * (c.uncertainty / 100);
        handprintUncertaintySumSq += Math.pow(uncAbs, 2);
      }
    });
    
    const footprintUncertaintyAbs = Math.sqrt(footprintUncertaintySumSq);
    const handprintUncertaintyAbs = Math.sqrt(handprintUncertaintySumSq);
    
    // Net absolute uncertainty propagation
    const netUncertaintyAbs = Math.sqrt(footprintUncertaintySumSq + handprintUncertaintySumSq);
    
    return {
      footprintTotal,
      handprintTotal,
      footprintUncertaintyAbs,
      handprintUncertaintyAbs,
      netUncertaintyAbs
    };
  }

  // SPA Views Rendering Orchestrator
  render() {
    this.renderSidebarCompany();
    
    if (this.state.company.isInitialized) {
      document.getElementById("sidebar-company-widget").style.display = "flex";
    } else {
      document.getElementById("sidebar-company-widget").style.display = "none";
    }
    
    // Render current view
    this.renderViewSpecifics(this.currentView);
  }

  renderSidebarCompany() {
    const nameEl = document.getElementById("sidebar-company-name");
    const stageEl = document.getElementById("sidebar-company-stage");
    
    if (this.state.company.isInitialized) {
      nameEl.innerText = this.state.company.name;
      stageEl.innerText = `${this.state.company.stage} · ${this.state.company.businessModel}`;
      
      const avatarEl = document.querySelector("#sidebar-company-widget .avatar");
      if (avatarEl) avatarEl.innerText = this.state.company.name.charAt(0).toUpperCase();
    }
    
    // Game mini status
    document.getElementById("mini-maturity-level").innerText = `Level ${this.state.maturityLevel}`;
    document.getElementById("mini-streak-val").innerText = `🔥 ${this.state.streak.count}w`;
  }

  renderViewSpecifics(view) {
    if (view === "intake") {
      this.renderIntakeView();
    } else if (view === "ledger") {
      this.renderLedgerView();
    } else if (view === "goals") {
      this.renderGoalsView();
    } else if (view === "game") {
      this.renderGameView();
    } else if (view === "share") {
      this.renderShareView();
    }
  }

  // Views Renderer Functions
  renderIntakeView() {
    if (this.state.company.isInitialized) {
      // Pre-fill profile
      document.getElementById("company-name").value = this.state.company.name;
      document.getElementById("company-url").value = this.state.company.url;
      document.getElementById("company-stage").value = this.state.company.stage;
      document.getElementById("business-model").value = this.state.company.businessModel;
      document.getElementById("team-size").value = this.state.company.teamSize;
      
      // Select active checkboxes
      document.querySelectorAll(".activity-checkbox-grid input[type='checkbox']").forEach(cb => {
        cb.checked = this.state.company.activities.includes(cb.value);
      });
    }
  }

  renderLedgerView() {
    const totals = this.calculateTotals();
    
    // Update derived net
    const netVal = totals.footprintTotal - totals.handprintTotal;
    const netSign = netVal > 0 ? "+" : "";
    
    document.getElementById("ledger-net-value").innerText = `${netSign}${netVal.toFixed(1)} tCO2e/yr`;
    document.getElementById("ledger-net-uncertainty").innerText = `Propagated Uncertainty Range: ±${totals.netUncertaintyAbs.toFixed(1)} tCO2e`;
    
    // Dynamic totals
    document.getElementById("footprint-total").innerText = `${totals.footprintTotal.toFixed(1)} tCO2e/yr`;
    document.getElementById("handprint-total").innerText = `${totals.handprintTotal.toFixed(1)} tCO2e/yr`;
    
    // Populate lists
    const s12List = document.getElementById("footprint-scope-1-2-list");
    const s3List = document.getElementById("footprint-scope-3-list");
    
    s12List.innerHTML = "";
    s3List.innerHTML = "";
    
    // Populate inline update select options
    const selectOptions = document.getElementById("metric-select-name");
    selectOptions.innerHTML = '<option value="" disabled selected>Select metric...</option>';
    
    this.state.metrics.forEach(m => {
      const row = document.createElement("div");
      row.className = `ledger-row ${m.source_type}`;
      row.innerHTML = `
        <div class="row-left">
          <div class="row-title">${m.name}</div>
          <div class="row-meta-tags">
            <span class="tag-freshness ${m.source_type === 'metered' ? 'tag-metered' : 'tag-modeled'}">${m.source_type}</span>
            <span class="tag-date">Last Updated: ${new Date(m.measured_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="row-right">
          <div class="row-value">
            ${m.value.toFixed(1)} <span style="font-size: 0.75rem;">${m.unit}</span>
            <span class="row-uncertainty">Uncertainty: ±${m.uncertainty}%</span>
          </div>
        </div>
      `;
      
      if (m.scope === 1 || m.scope === 2) {
        s12List.appendChild(row);
      } else {
        s3List.appendChild(row);
      }
      
      // Inline select append
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.innerText = m.name;
      selectOptions.appendChild(opt);
    });
    
    // Handprint Gated Claims List
    const claimList = document.getElementById("handprint-claims-list");
    claimList.innerHTML = "";
    
    if (this.state.claims.length === 0) {
      claimList.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem; font-style: italic; font-size: 0.85rem;">
          No avoided emission claims recorded. Click "Add Avoided Claim (+)" above to construct your first gated claim.
        </div>
      `;
    } else {
      this.state.claims.forEach(c => {
        const row = document.createElement("div");
        row.className = `ledger-row ${c.status === 'flagged' ? 'flagged' : ''}`;
        
        let subText = `<span class="tag-freshness tag-modeled">MODELED counterfactual</span>`;
        let valText = `${c.value.toFixed(1)} <span style="font-size: 0.75rem;">tCO2e/yr</span>
                       <span class="row-uncertainty">Uncertainty: ±${c.uncertainty}%</span>`;
        
        if (c.status === "flagged") {
          subText = `<span class="tag-flagged">FAILED GATE</span>`;
          valText = `<del>${c.value.toFixed(1)} tCO2e</del> &rarr; 0.0 <span style="font-size: 0.75rem;">tCO2e/yr</span>
                     <span class="row-uncertainty" style="color: var(--accent-footprint);">Reason: Gated - would have occurred regardless</span>`;
        }
        
        row.innerHTML = `
          <div class="row-left">
            <div class="row-title" style="display: flex; align-items: center; gap: 0.5rem;">
              ${c.name}
              ${c.additionality_status === 'Strong' ? '🛡️' : ''}
            </div>
            <div class="row-meta-tags">
              ${subText}
              <span class="tag-date">Gated on: ${new Date(c.published_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div class="row-right">
            <div class="row-value">
              ${valText}
            </div>
          </div>
        `;
        claimList.appendChild(row);
      });
    }
  }

  renderGoalsView() {
    // Populate filter owners
    const filterStatus = document.getElementById("filter-goal-status").value;
    
    // Populate goal board form owner select
    const formOwnerSelect = document.getElementById("goal-owner");
    formOwnerSelect.innerHTML = "";
    this.state.members.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.innerText = `${m.name} (${m.role})`;
      formOwnerSelect.appendChild(opt);
    });
    
    // Populate active goals
    const goalsContainer = document.getElementById("goals-list-container");
    goalsContainer.innerHTML = "";
    
    let filteredGoals = this.state.goals;
    if (filterStatus !== "all") {
      filteredGoals = this.state.goals.filter(g => g.status === filterStatus);
    }
    
    if (filteredGoals.length === 0) {
      goalsContainer.innerHTML = `
        <div style="grid-column: span 2; text-align: center; color: var(--text-muted); padding: 3rem; font-style: italic; border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
          No matching goals in this list. Create or recommend a goal to start mapping actions!
        </div>
      `;
    } else {
      filteredGoals.forEach(g => {
        const owner = this.state.members.find(m => m.id === g.owner_id) || { name: "Unassigned" };
        const card = document.createElement("div");
        card.className = "goal-card";
        
        // Progress percentage mapping
        let progressPercent = 0;
        let badgeClass = "status-not-started";
        if (g.status === "In Progress") {
          progressPercent = 50;
          badgeClass = "status-in-progress";
        } else if (g.status === "Complete") {
          progressPercent = 100;
          badgeClass = "status-complete";
        }
        
        // Evidence string
        let evidenceText = `<span class="evidence-list-text">No evidence linked</span>`;
        if (g.evidence && g.evidence.length > 0) {
          evidenceText = `<span class="evidence-list-text" style="color: var(--accent-handprint); font-weight: 600;">✓ ${g.evidence.length} File(s) attached</span>`;
        }
        
        card.innerHTML = `
          <div class="goal-card-header">
            <h4 class="goal-card-title">${g.title}</h4>
            <span class="goal-status-badge ${badgeClass}">${g.status}</span>
          </div>
          
          <div class="goal-card-meta">
            <span>Owner: <strong>${owner.name}</strong></span>
            <span>Due: <strong>${new Date(g.deadline).toLocaleDateString()}</strong></span>
          </div>
          
          <div class="goal-progress-container">
            <div class="progress-label-row">
              <span>Goal Progress</span>
              <span>${progressPercent}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>
          </div>
          
          <div class="goal-evidence-area">
            ${evidenceText}
            <span class="link-attach-evidence" data-id="${g.id}">Attach Evidence</span>
          </div>
          
          <div class="goal-actions-row">
            <label style="font-size: 0.7rem;">Status:</label>
            <select class="select-goal-status" data-id="${g.id}">
              <option value="Not Started" ${g.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
              <option value="In Progress" ${g.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Complete" ${g.status === 'Complete' ? 'selected' : ''}>Complete</option>
            </select>
          </div>
        `;
        
        // Bind attach evidence click
        card.querySelector(".link-attach-evidence").addEventListener("click", () => {
          this.triggerEvidenceModal(g.id, "goal");
        });
        
        // Bind status selector change
        card.querySelector(".select-goal-status").addEventListener("change", (e) => {
          this.updateGoalStatus(g.id, e.target.value);
        });
        
        goalsContainer.appendChild(card);
      });
    }
    
    // Bind status filter change refresh
    document.getElementById("filter-goal-status").onchange = () => this.renderGoalsView();
    
    // Populate goals recommendations
    this.renderGoalsRecommendations();
  }

  updateGoalStatus(id, newStatus) {
    const goal = this.state.goals.find(g => g.id === id);
    if (goal) {
      const oldStatus = goal.status;
      goal.status = newStatus;
      
      // Point reward trigger
      if (newStatus === "Complete" && oldStatus !== "Complete") {
        this.addEvidencePoints(15, `Completed goal: "${goal.title}"`);
      }
      
      this.updateMaturityLevel();
      this.saveState();
    }
  }

  renderGoalsRecommendations() {
    const container = document.getElementById("recommendations-container");
    container.innerHTML = "";
    
    // Suggest goals corresponding to active activities that do NOT already exist
    const activeActs = this.state.company.activities || [];
    let sugCount = 0;
    
    activeActs.forEach(actKey => {
      const template = GOAL_TEMPLATES[actKey];
      if (template) {
        // Check if goal already added
        const exists = this.state.goals.some(g => g.title === template.title);
        if (!exists) {
          sugCount++;
          const card = document.createElement("div");
          card.className = "rec-card";
          card.innerHTML = `
            <div class="rec-title">${template.title}</div>
            <div class="rec-meta">
              <span>Related to: ${ACTIVITIES_DB[actKey].name}</span>
              <button class="rec-add-btn" data-act="${actKey}">+ Add Board</button>
            </div>
          `;
          
          card.querySelector(".rec-add-btn").addEventListener("click", () => {
            this.addGoalFromRecommendation(template.title, actKey);
          });
          
          container.appendChild(card);
        }
      }
    });
    
    if (sugCount === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 1rem; font-style: italic; font-size: 0.75rem;">
          Great work! All recommended operational goals are already listed on your Goal Board.
        </div>
      `;
    }
  }

  addGoalFromRecommendation(title, actKey) {
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: title,
      owner_id: "rae",
      status: "Not Started",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days
      level: "company-wide",
      evidence: []
    };
    
    this.state.goals.push(newGoal);
    this.updateMaturityLevel();
    this.saveState();
  }

  renderGameView() {
    // Game level Gauge matching 0-5
    const lvl = this.state.maturityLevel;
    const titles = ["Unmapped", "Mapped", "Gated", "Metered", "Active", "Improved"];
    
    document.getElementById("game-maturity-level").innerText = `Level ${lvl}`;
    document.getElementById("game-maturity-title").innerText = titles[lvl];
    
    // Draw SVG circle ring fill
    // Stroke-dasharray is 251.2 (2 * PI * r, r=40)
    const ring = document.getElementById("game-maturity-ring-fill");
    const circumference = 251.2;
    const progressFraction = lvl / 5;
    const offset = circumference - (progressFraction * circumference);
    ring.style.strokeDashoffset = offset;
    
    // Set maturity checklist visual states
    for (let i = 1; i <= 5; i++) {
      const itemEl = document.getElementById(`check-level-${i}`);
      if (lvl >= i) {
        itemEl.classList.add("done");
      } else {
        itemEl.classList.remove("done");
      }
    }
    
    // Game Stats
    document.getElementById("game-streak-count").innerText = `${this.state.streak.count} Weeks`;
    document.getElementById("game-evidence-points").innerText = this.state.evidencePoints;
    
    // Points Log
    const logsContainer = document.getElementById("game-events-log");
    logsContainer.innerHTML = "";
    
    if (this.state.evidenceLogs.length === 0) {
      logsContainer.innerHTML = `<li class="empty-log">No points earned yet. Add evidence to goals or claims!</li>`;
    } else {
      this.state.evidenceLogs.slice(0, 5).forEach(log => {
        const item = document.createElement("li");
        item.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.15rem;">
            <strong>${log.text}</strong>
            <span style="color: var(--accent-handprint); font-weight: 700;">+${log.points} pts</span>
          </div>
          <div style="font-size: 0.65rem; color: var(--text-muted);">${new Date(log.date).toLocaleString()}</div>
        `;
        logsContainer.appendChild(item);
      });
    }
  }

  renderShareView() {
    const totals = this.calculateTotals();
    
    // Company Header Meta
    document.getElementById("share-company-title").innerText = `${this.state.company.name || "Configure Startup"} Impact Profile`;
    
    const stageBadge = document.getElementById("share-company-stage-badge");
    stageBadge.innerText = this.state.company.stage || "Intake Stage";
    
    const modelBadge = document.getElementById("share-company-model-badge");
    modelBadge.innerText = this.state.company.businessModel || "Business Model";
    
    const dates = this.state.metrics.map(m => new Date(m.measured_at).getTime());
    let freshDate = "Freshness: No data";
    if (dates.length > 0) {
      const maxDate = new Date(Math.max(...dates));
      freshDate = `Freshness: ${maxDate.toLocaleDateString()}`;
    }
    document.getElementById("share-freshness-date").innerText = freshDate;
    
    // Two-Axis Coordinates Plotting
    const matrixDot = document.getElementById("matrix-dot");
    const matrixEx = document.getElementById("matrix-explanation");
    
    // Stage coordinate (X)
    let xCoord = 15; // default Pre-seed
    if (this.state.company.stage === "Seed") xCoord = 40;
    else if (this.state.company.stage === "Series A") xCoord = 65;
    else if (this.state.company.stage === "Series B+") xCoord = 90;
    
    // Maturity level coordinate (Y)
    const lvl = this.state.maturityLevel;
    const yCoords = [10, 28, 46, 64, 82, 95];
    const yCoord = yCoords[lvl];
    
    matrixDot.style.left = `${xCoord}%`;
    matrixDot.style.bottom = `${yCoord}%`;
    
    const stageStr = this.state.company.stage || "Unmapped";
    const integrityStr = ["Level 0: Unmapped", "Level 1: Mapped", "Level 2: Gated", "Level 3: Metered", "Level 4: Active", "Level 5: Improved"][lvl];
    matrixEx.innerHTML = `Your company plots at <strong>X: ${stageStr} scaling</strong> × <strong>Y: ${integrityStr} integrity</strong>. The scored axis maps structural data readiness, safeguarding claims against greenwash diligence risks.`;
    
    // Footprint & Handprint Values
    document.getElementById("share-footprint-value").innerText = `${totals.footprintTotal.toFixed(1)} tCO2e`;
    document.getElementById("share-handprint-value").innerText = `${totals.handprintTotal.toFixed(1)} tCO2e`;
    
    // Range Band Calculations
    const netVal = totals.footprintTotal - totals.handprintTotal;
    
    // Bounds using uncertainty absolute
    const minBound = netVal - totals.netUncertaintyAbs;
    const maxBound = netVal + totals.netUncertaintyAbs;
    
    document.getElementById("share-band-min").innerText = `${minBound.toFixed(1)} tCO2e`;
    document.getElementById("share-band-max").innerText = `${maxBound.toFixed(1)} tCO2e`;
    
    // Slider graphic offsets
    // Scale derived values relative to net value bounds
    // Clamp coordinates to percentage bounds
    const maxLimit = Math.max(Math.abs(minBound), Math.abs(maxBound), 20) * 1.5;
    const toPercent = (val) => {
      const percent = ((val + maxLimit) / (maxLimit * 2)) * 100;
      return Math.min(Math.max(percent, 5), 95);
    };
    
    const minPct = toPercent(minBound);
    const maxPct = toPercent(maxBound);
    const centerPct = toPercent(netVal);
    
    const fillEl = document.getElementById("share-band-fill");
    fillEl.style.left = `${minPct}%`;
    fillEl.style.width = `${maxPct - minPct}%`;
    
    const markerEl = document.getElementById("share-band-center");
    markerEl.style.left = `${centerPct}%`;
    
    // Diligence checklist table
    const tableBody = document.getElementById("share-diligence-tbody");
    tableBody.innerHTML = "";
    
    if (this.state.claims.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); font-style: italic; padding: 2rem;">
            No positive claims submitted for baseline/additionality audits yet.
          </td>
        </tr>
      `;
    } else {
      this.state.claims.forEach(c => {
        const tr = document.createElement("tr");
        if (c.status === "flagged") {
          tr.className = "flagged-row";
        }
        
        let addStatusText = "";
        if (c.additionality_status === "Strong") {
          addStatusText = `<span class="tag-freshness tag-metered" style="font-size: 0.65rem;">🛡️ Strong Additionality</span>`;
        } else if (c.additionality_status === "Moderate") {
          addStatusText = `<span class="tag-freshness tag-modeled" style="font-size: 0.65rem;">Moderate Additionality</span>`;
        } else {
          addStatusText = `<span class="tag-flagged">FAILED GATE (No Additionality)</span>`;
        }
        
        // Evidence checklist status
        let evidenceContent = `<span style="color: var(--text-muted);">None attached</span>`;
        if (c.evidence && c.evidence.length > 0) {
          evidenceContent = `<span class="link-diligence-evidence" data-id="${c.id}">View ${c.evidence.length} Counterfactual verification link(s)</span>`;
        }
        
        tr.innerHTML = `
          <td><strong>${c.name}</strong></td>
          <td>${c.value.toFixed(1)} tCO2e/yr <span style="font-size:0.7rem; color:var(--text-muted); display:block;">±${c.uncertainty}% unc.</span></td>
          <td>${addStatusText}</td>
          <td><span class="tag-date">${c.marginal_signal ? 'Marginal Signal (MOER)' : 'Average intensity'}</span></td>
          <td>${evidenceContent}</td>
        `;
        
        if (c.evidence && c.evidence.length > 0) {
          tr.querySelector(".link-diligence-evidence").addEventListener("click", () => {
            alert(`Verified Evidence for Claim: "${c.name}"\n\nReference: ${c.evidence[0].ref}\nContext: ${c.evidence[0].note || "No note added."}`);
          });
        }
        
        tableBody.appendChild(tr);
      });
    }
  }

  toggleAudienceView(isExternal) {
    const sidebar = document.querySelector(".app-sidebar");
    const externalBtn = document.getElementById("btn-toggle-external");
    const internalBtn = document.getElementById("btn-toggle-internal");
    
    if (isExternal) {
      sidebar.classList.add("hidden");
      externalBtn.classList.add("active");
      internalBtn.classList.remove("active");
      
      // Pad main content area since sidebar is removed
      document.querySelector(".app-main").style.paddingLeft = "3.5rem";
      
      // Render clean header in Share view to let user click back to internal
      const mainHeader = document.querySelector(".app-main");
      
      let floatBack = document.getElementById("floater-back-internal");
      if (!floatBack) {
        floatBack = document.createElement("button");
        floatBack.id = "floater-back-internal";
        floatBack.className = "btn btn-secondary";
        floatBack.style.position = "fixed";
        floatBack.style.bottom = "2rem";
        floatBack.style.right = "2rem";
        floatBack.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.4)";
        floatBack.style.zIndex = "999";
        floatBack.innerHTML = `&larr; Exit Investor Mode`;
        
        floatBack.addEventListener("click", () => {
          this.toggleAudienceView(false);
        });
        document.body.appendChild(floatBack);
      }
    } else {
      sidebar.classList.remove("hidden");
      internalBtn.classList.add("active");
      externalBtn.classList.remove("active");
      
      document.querySelector(".app-main").style.paddingLeft = "3.5rem";
      
      const floatBack = document.getElementById("floater-back-internal");
      if (floatBack) floatBack.remove();
    }
  }
}

// Instantiate App
window.addEventListener("DOMContentLoaded", () => {
  window.app = new ClimateDashboardApp();
});
