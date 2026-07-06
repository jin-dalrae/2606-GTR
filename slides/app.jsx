import { GTRHeader, GTRSidebar, fieldworkSlide, fieldworkFeedback } from "./shell.jsx";

const { useEffect, useState } = React;

const testParticipants = [
  ["Amali", "Data engineer met at a networking event", "Role-played founder; technical and data perspective"],
  ["Caroline", "Investment analyst", "Role-played founder; investor perspective"],
  ["Josh", "CCA Interaction Design student", "Role-played founder; peer-design perspective"],
  ["Ted", "Startup founder", "Actual founder; direct target-audience perspective"],
  ["Brian", "Accessibility Lead at Superhuman", "Role-played founder; accessibility expert perspective"],
];

const sessionObservations = [
  ["Amali", "Assessment", "Preferred the shorter, step-by-step assessment direction."],
  ["Amali", "Report", "Recommended combining graphs with supporting explanation."],
  ["Amali", "Dashboard", "Could not interpret milestones or impact projection without explanation."],
  ["Amali", "Product", "Could not identify the product type, purpose, or intended audience from the prototype alone."],
  ["Amali", "Feature", "Requested peer comparison and a leaderboard concept."],
  ["Caroline", "Assessment", "Preferred preset choices and the Back/Next flow."],
  ["Caroline", "Privacy", "Raised stealth-stage sensitivity around sharing company documents."],
  ["Caroline", "Report", "Preferred Report 2, the infographic version."],
  ["Caroline", "Terms", "Needed definitions for net impact and maturity levels."],
  ["Caroline", "Audience", "Suggested including larger companies in future research."],
  ["Josh", "Assessment", "Preferred a continuous flow when step count and expected duration were visible."],
  ["Josh", "Report", "Found the text-heavy report difficult to parse."],
  ["Josh", "Sharing", "Would not publicly share a high-emissions result."],
  ["Ted", "Value", "Did not see enough benefit to justify completing the intake."],
  ["Ted", "Privacy", "Treated pitch-deck upload as an IP risk without a clear return."],
  ["Brian", "Accessibility", "Flagged asterisk-only required-field labeling as inaccessible."],
  ["Brian", "Value", "Could not identify a sufficient reason to complete the intake."],
];

const aggregatedFindings = [
  ["Assessment format split", "Amali and Caroline preferred Assessment 2, the step-by-step mobile flow. Josh preferred Assessment 1, the continuous flow, with visible step count and time estimate.", "Retest Assessment 1 against Assessment 2 with more founders before selecting a default."],
  ["Preset inputs over typing", "Amali, Caroline, Josh, and Brian preferred dropdowns and checkboxes over free text.", "Add dropdowns for business model; minimize typing."],
  ["Document upload friction", "Caroline raised stealth-mode concern; Josh, Ted, and Brian also flagged sensitive uploads.", "Replace uploads with manual aggregate fields; keep files local or incubator-only path."],
  ["Value proposition missing", "Amali: product purpose unclear. Ted stopped at upload; Brian asked why he would complete the form.", "State benefit before document step; show preview after step 1."],
  ["Footprint/handprint confusion", "Caroline: card purpose unclear; SaaS handprint = transport avoidance via remote work.", "Add labels; tailor activity defaults by business model."],
  ["Report format", "Amali requested a combination of Report 1 and Report 2; Caroline, Josh, and Brian preferred Report 2's infographic direction.", "Use Report 2 as the visual overview and Report 1 as the explanation and methodology layer."],
  ["Net impact and maturity unexplained", "Caroline and Josh required interviewer explanation of net impact and levels 1-5.", "Add inline definitions or tooltips."],
  ["Dashboard density", "Amali: milestones and projection confusing; Josh: four-card row skipped; Brian: goals/milestones should be top.", "Vertical stack; separate maturity from metrics; combine goals and milestones."],
  ["LinkedIn sharing conditional", "Josh: would not share high-emission results publicly.", "Share only positive or improved metrics; default to private or investor-only."],
  ["Audience scope unclear", "Amali: unclear if product is an app; climate-only, environment-related, or finance audience.", "State product type, audience, and scope on landing page."],
  ["SaaS / AI fit", "Ted: primary cost is cloud/AI tokens; limited actionable levers at early stage.", "Add token/compute observability; reduce hardware defaults for SaaS."],
  ["Accessibility", "Brian: asterisk-only required fields fail accessibility.", "Use visible [Required] text."],
  ["Peer comparison request", "Amali: wants to see what other startups are doing.", "Add peer benchmark or anonymized comparison section."],
  ["Leaderboard request", "Amali requested leaderboard.", "Out of scope for MVP unless defined; record as future item."],
  ["Larger-company segment", "Caroline and Brian suggested bigger companies may yield richer insights than early startups.", "Record as future research path; not tested in this round."],
];

const onboardingSteps = [
  ["01", "Tell us about your startup", "Company name, website, business model, funding stage, team size. Stated duration: 2-5 minutes."],
  ["02", "Add your documents", "Optional pitch deck and accounts. Files stay local in browser."],
  ["03", "Confirm what your company does", "Checkbox list of EMITS (-) and AVOIDS (+) activities. Selection drives estimation scope."],
  ["04", "Describe it in your words", "Optional free-text field. Generate my assessment ends intake."],
];

const fieldworkArtifacts = [
  ["Journey storyboard", "storyboard.jpeg", "Eight-stage journey from discovery at demo day through assessment, dashboard use, team access, and extended use"],
  ["Assessment 1 (A)", "assessment1.jpeg + assessment1-stage.jpeg", "Continuous/long-form free impact assessment; the investment-stage paper is part of this version"],
  ["Assessment 2 (B)", "assessment2-mobile.jpeg", "Four-screen mobile assessment with progress, Back, and Next controls"],
  ["Report 1 (A)", "report1-information.jpeg", "Information-led assessment report with footprint, handprint, hotspots, comparison, cost exposure, and methodology"],
  ["Report 2 (B)", "report2-infographic.jpeg", "Infographic assessment report with visual metric cards, maturity gauge, hotspot charts, and impact-beyond-carbon cards"],
  ["Dashboard concept", "dashboard.jpeg", "Extension beyond the instant report: footprint, handprint, derived net, maturity, goals, milestones, and impact projection"],
];

const emitsActivities = [
  "Cloud & AI compute",
  "Hardware & electronics",
  "Air travel & commutes",
  "Key vendors & SaaS",
  "Logistics & distribution",
];

const avoidsActivities = [
  "Grid decarbonization",
  "Transport avoidance",
  "Low-carbon materials",
];



const journeyStages = [
  ["Entice", "Demo day", "Awareness via startups presenting impact calculations."],
  ["Entice", "Peer referral", "Referral includes app access and discount code."],
  ["Enter", "Mobile open", "Site opened on mobile; free-assessment CTA visible."],
  ["Engage", "Onboarding", "Pitch deck, accounts, and intake questions completed."],
  ["Engage", "Instant report", "Analysis report delivered; LinkedIn share shown."],
  ["Engage", "Dashboard", "Desktop login for goals, data, and checkpoints."],
  ["Exit", "Team invite", "Team invite link issued; legitimacy evaluated."],
  ["Extend", "Operating use", "Additional company documents added to dashboard."],
];

const archiveMap = [
  {
    id: "fieldwork",
    label: "Fieldwork report",
    purpose: "Prototype user testing for a climate impact platform for startups.",
    question: "Can founders complete intake and read the report and dashboard concepts?",
  },
  {
    id: "report",
    label: "Climate Goal Platform Research Report",
    purpose: "Explains the rescoped product direction and the measurement logic behind it.",
    question: "What is GTR now trying to prove?",
  },
  {
    id: "stage1",
    label: "PRD Stage 1",
    purpose: "Defines the climate-startup MVP, its users, constraints, and success metrics.",
    question: "What ships first?",
  },
  {
    id: "stage2",
    label: "PRD Stage 2",
    purpose: "Extends the product toward generalization, customization, and follow-up.",
    question: "What expands after the wedge works?",
  },
  {
    id: "gtr-partners",
    label: "GTR Partners deck",
    purpose: "Shows the earlier advisory and transition-service framing.",
    question: "Where did the project start?",
  },
  {
    id: "product-deck",
    label: "Climate Goal Platform deck",
    purpose: "Converts the service story into a product story with a net-impact model.",
    question: "How does the direction change on slides?",
  },
];

const reportTakeaways = [
  {
    title: "The wedge is climate startups first",
    body: "The project now treats climate startups as the initial buyer because their valuation already depends on an impact claim and they need both footprint and handprint tracked in one place.",
  },
  {
    title: "Positive and negative impact stay separate",
    body: "The dashboard does not merge avoided emissions with the footprint. It keeps the accounting bases visible and exposes the net as a derived figure.",
  },
  {
    title: "The system is operational, not cosmetic",
    body: "The product is meant to run weekly with goals, evidence, and integrity gates. The slides and docs are all pointing at that workflow.",
  },
];

const competitiveLandscape = [
  { category: "Footprint-only carbon tools", offer: "Measure the negative side well", gap: "Do not resolve the positive side." },
  { category: "Avoided-emissions and credit tools", offer: "Handle parts of the + side", gap: "Usually sit outside a live operating workflow." },
  { category: "Climate Brick", offer: "A useful scaling and capital reference", gap: "Not an impact measurement engine." },
  { category: "General AI summaries", offer: "Compress navigation and topic extraction", gap: "Can hide the source trail and minority positions." },
];

const productFlow = [
  ["1. Map", "List the company's operations, vendors, product use, and customer effects."],
  ["2. Rank", "Sort activities by likely materiality so the intake can start fast."],
  ["3. Measure", "Use a tiered ladder: proxy, metered, modeled."],
  ["4. Gate", "Baseline, displacement, additionality, marginal signal, rebound."],
  ["5. Monitor", "Track each metric at its natural cadence."],
];

const stage1Goals = [
  "Let a climate founder produce a defensible net view in under 15 minutes of intake.",
  "Gate every positive claim behind baseline, displacement, and additionality checks.",
  "Label every metric by cadence and freshness.",
  "Turn the number into a weekly habit through cooperative gamification.",
  "Preserve uncertainty in the share page for VC and LP review.",
];

const stage2Goals = [
  "Ship the Stage 1 PRD as a working web app, not paper artifacts.",
  "Keep the +/- separation visible at every step — landing, intake, report, dashboard, share card.",
  "Prove the 15-minute intake promise with a real form, real defaults, and a real first-render report.",
  "Ground every number the product shows in a curated evidence library — no invented citations.",
  "Make privacy the path of least resistance, not the path of most friction.",
  "Preserve the climate-startup wedge — no broad tech-startup segment, no leaderboard, no gamification expansion.",
];

const stage2Funnel = [
  ["Landing", "Sharper copy: explicit audience (Seed–Series B climate-tech founders), scope, product type, and a 'your data stays private' line."],
  ["Methodology", "Dedicated screen in the funnel. The founder sees the framework before being asked to fill in the form."],
  ["6-step intake", "Company → Stage → Model → Docs (optional) → Activity → Review. Visible progress, step count, and time estimate."],
  ["Instant report", "Renders from the local snapshot without auth — the same path anonymous previews use, now the default."],
  ["Account gate", "Log in or sign up to save the snapshot. Auth is downstream of value, not a precondition to it."],
  ["Dashboard", "Goals rail, live footprint/handprint, risk radar, projection, AI briefing, and saved report history."],
];

const stage2Profiles = [
  ["SaaS / Cloud software", "Cloud spend + headcount emphasized; hardware defaults reduced; token / compute observability surfaced."],
  ["Hardware / Manufacturing", "Physical operations, supply chain, and outsourced Scope 3 manufacturing kept prominent."],
  ["Food and Beverage", "Supply-chain agriculture, raw ingredients, logistics, and processing surfaced as the dominant categories."],
  ["Pet Services", "Waste-processing, retail logistics, and operations emphasized over software carbon."],
  ["Biotech / Lab", "High-power lab equipment, clinical waste, and diagnostics shipping surfaced."],
  ["Foundation Model / Heavy Compute", "1000x multiplier on compute estimates; 25,000 tCO2e/yr RLHF / data-annotation workforce baseline injected."],
  ["Hybrid", "Max-rate aggregation across matched sectors; combined notes and source list."],
];

const stage2Evidence = [
  ["FACTOR_SOURCES", "Provenance for every default emission factor — source, publisher, year, URL, methodology, derivation basis."],
  ["FRAMEWORKS", "GHG Protocol Corporate + Scope 3, SBTi, SCI / ISO 21031, Project Frame, additionality, rebound effect, ISO 14040/14044 LCA, GHG Protocol Product Standard."],
  ["BENCHMARKS", "Per-FTE × headcount peer ranges, sector-specific bands (SaaS, Hardware, F&B, Pet, Biotech), and funding-stage headcount defaults."],
  ["CARBON_PRICES", "EU ETS compliance price + EPA social cost of carbon — translates tonnes into a $-cost band."],
  ["IMPACT_DIMENSIONS", "Energy, water, waste modeled (derived from the carbon model); land and biodiversity as a qualitative materiality flag."],
  ["CASE_PRECEDENTS", "Real, dated, cited precedents behind the risks raised (CSRD, California SB 253/261, the Jevons / rebound evidence base, greenwashing scrutiny)."],
  ["buildFactPack()", "Assembles the curated facts relevant to one assessment into a citation-ready block for the AI prompt. The AI cannot cite anything outside this pack."],
];

const stage2ReportTiles = [
  ["Modeled footprint + hotspots", "Per-activity tCO2e from FACTOR_SOURCES; ranked bars driven by selection in the Activity step."],
  ["Impact beyond carbon", "Energy, water, waste modeled from the same carbon model; land and biodiversity as a materiality flag."],
  ["Peer benchmark band", "Sector-specific low / high range from BENCHMARKS, shown as a labelled band — not a competitive leaderboard."],
  ["Cost-exposure estimate", "Footprint × (EU ETS compliance price + EPA social cost of carbon) — labelled as a forward-looking estimate."],
  ["Relevant precedents", "CASE_PRECEDENTS filtered to the company's footprint profile (regulation, rebound, greenwashing)."],
  ["Methodology breakdown", "FRAMEWORKS used and the basis for each default — behind the 'Show methodology' expander."],
  ["AI briefing", "Gemini-grounded narrative constrained to cite only the assembled fact pack. Search queries and web sources surfaced inline."],
];

const stage2Dashboard = [
  ["Goals rail", "Owned actions, deadlines, and evidence points — grouped near the top per the dashboard-density finding."],
  ["Live footprint & handprint", "Current snapshot, no projection. Net and cost moved to a Details expander."],
  ["Maturity level", "Compact, separate from the metric cards — per Brian's hierarchy feedback."],
  ["Risk radar", "Operational risks (regulation, rebound, greenwashing scrutiny) drawn from CASE_PRECEDENTS."],
  ["Projection", "Collapsed by default. The forward view is opt-in, not the first thing the founder sees."],
  ["AI briefing", "Persistent on the dashboard so the narrative travels with the data."],
  ["Report history", "Saved assessment snapshots with open and delete actions. Each snapshot is a complete workspace state."],
];

const stage2Stack = [
  ["Frontend", "Vanilla ES-module SPA (Vite 6)", "Stays under the LOC ceiling; no framework migration was on the table."],
  ["Backend", "Hand-rolled router on Cloudflare Workers", "No framework — endpoints fit the surface area."],
  ["Database", "D1 (SQLite)", "Accounts, sessions, per-user workspace state, document metadata, anonymous preview limits, AI token logs."],
  ["Storage", "R2", "Uploaded document bytes. Wired but optional — the UI no longer asks."],
  ["AI", "Gemini via Secrets Store binding (AI_API_KEY)", "Report + risk-radar generation; Google Search grounding when a public website is supplied."],
  ["Auth", "PBKDF2 (WebCrypto) + HttpOnly Secure SameSite=Lax cookies", "Timing-safe comparison; no third-party auth."],
];

const stage2Changes = [
  "Auth moved from the start of the funnel to after the instant report (Phase A).",
  "Document upload demoted from required step to optional, skippable step (Phase B).",
  "Free-text intake fields converted to dropdowns with 'Other (specify)' escape hatches (Phase C).",
  "Dashboard four-card row split; net and cost moved to a Details expander; goals grouped at the top (Phase D).",
  "Report: hybrid layout — visual overview by default, methodology + evidence behind expanders (Phase E).",
  "Intake tailored by business model — SaaS, hardware, food, pet, biotech, foundation model, hybrid (Phase F).",
  "Privacy / sharing: per-report visibility (private / link / investor) and an auto-generated OG grade card (Phase G).",
  "Foundation-model teams no longer silently mis-measured by per-FTE SaaS baselines.",
  "Required fields marked with a visible [Required] chip and aria-required='true' (Q1 a11y).",
  "Inline glossary tooltips wrap 'net impact', 'footprint', 'handprint', 'maturity level' on first use (Q2).",
  "Landing copy states audience, scope, product type, and a 'your data stays private' line up front (Q4).",
];

const stage2Open = [
  "Does the 6-step wizard compress to fewer steps without losing review-ability, or does it stay at 6?",
  "Do founders actually complete the assessment without facilitator help — the question fieldwork couldn't answer?",
  "Does the visibility model (private / link / investor) feel right, or do LPs and customers need separate surfaces?",
  "Do the AI briefing citations change what a founder does next, or do they sit unread below the metric tiles?",
  "Does the cost-exposure estimate (EU ETS + EPA SCC) belong in the headline, the report, or only the Details expander?",
  "Does the foundation-model path hold up against real data, not just the 1000x heuristic?",
  "Does the report history surface become the home for longitudinal progress, or do founders still want a separate weekly view?",
  "How much of the Stage 1 PRD's 'weekly operating loop' survive once the novelty of the first report wears off?",
];

const stage2McpTools = [
  ["list_business_models", "Returns the recognized business-model archetypes. Metadata only — does not feed the math."],
  ["list_funding_stages", "Returns the recognized funding stages the assessment accepts (Pre-seed → Growth)."],
  ["list_activities", "Returns every activity the founder can include in their assessment, with the default team size and the auto-included ones (scope2-grid, scope1-direct)."],
  ["list_glossary_terms", "Returns the full climate-impact glossary. The AI uses it to answer founder questions without inventing definitions."],
  ["list_frameworks", "Returns the standards the assessment rests on (GHG Protocol, SBTi, SCI, Project Frame, etc.)."],
  ["compute_snapshot", "Computes a modeled footprint + handprint snapshot from raw inputs. Same per-FTE factors the standalone site uses, so the numbers are consistent end-to-end."],
  ["generate_report", "Calls /api/generate-report internally; returns the full AI-graded report (headline, hotspots, peer benchmark, cost exposure, risk radar, AI briefing with cited sources)."],
  ["create_dashboard_save_link", "Generates a one-time, short-TTL link the founder can click to push the assessment into the dashboard. Opt-in only."],
];

const stage2OnboardingCompare = [
  ["Where it runs", "Browser, on the standalone site", "AI client (ChatGPT, Claude Desktop, Cursor)"],
  ["Form factor", "Visual 6-step wizard with progress + Back/Next", "Conversational — the AI asks, the founder answers"],
  ["Jargon handling", "Inline glossary tooltips + a click-to-open modal", "AI calls list_glossary_terms to look up terms before answering"],
  ["Math path", "computeSnapshot() in app.js, same as MCP compute_snapshot", "compute_snapshot tool — same ACTIVITIES_DB, same FACTOR_SOURCES"],
  ["Report path", "Renders from the local state snapshot, then optionally saves", "generate_report tool, returns JSON the AI narrates; dashboard save is opt-in via create_dashboard_save_link"],
  ["Document upload", "Optional, skippable step in step 4 of the wizard", "Not supported — the AI client never sees source files"],
  ["Auth", "Required only to save the snapshot (account gate after the report)", "Never required for the AI path; the assessment lives in the client's conversation"],
  ["Best for", "Founders who want a self-serve web form they can come back to", "Founders who already work inside ChatGPT / Claude / Cursor and prefer to stay there"],
];

const stage2ReportHistoryActions = [
  ["Save", "POST /api/reports — serializes the current workspace state as a snapshot in D1."],
  ["List", "GET /api/reports — returns all snapshots for the current user, newest first."],
  ["Open", "GET /api/reports/:id — replaces the workspace state with a past snapshot, putting the founder back into a specific moment."],
  ["Delete", "DELETE /api/reports/:id — removes the snapshot. The current state is unaffected."],
];

const stage2ShareVisibility = [
  ["Private", "Default. Only the account holder sees it. LinkedIn and share-card buttons stay disabled until a different visibility is chosen."],
  ["Link only", "Anyone with the URL can open it. No public listing. Useful for sending a single investor a quick look."],
  ["Investor link", "Time-limited, token-protected URL valid for 7 days. Distinct from a public link and clearly labelled in the UI."],
];

const stage2InsightSources = [
  ["Snapshot signals", "Footprint total, hotspot ranks, maturity level, +/- net, and the share of model-default vs measured inputs."],
  ["Industry patterns", "Sector benchmarks from BENCHMARKS — what a comparable Seed–Series B climate-tech team usually looks like."],
  ["Case precedents", "CASE_PRECEDENTS filtered to the founder's footprint profile (regulation, rebound, greenwashing)."],
  ["Founder inputs", "Notes the founder wrote in the intake, the company website fetched for grounding, and the chosen business-model profile."],
  ["Prior snapshots", "If the founder has saved a previous report, the deltas feed the 'what changed since last time' recommendations."],
];

const stage2MaturityStages = [
  ["Level 1 — Estimated", "All inputs are model defaults. The first report is directional; the founder is encouraged to replace defaults with measured data."],
  ["Level 2 — Mixed", "Some measured inputs (kWh from a utility bill, supplier invoices, token spend). The uncertainty band visibly narrows for the measured categories."],
  ["Level 3 — Measured", "Most categories have measured inputs. The model still labels which are modeled and which are measured; the +/- separation stays visible."],
  ["Level 4 — Audited", "Inputs are externally reviewed (CSRD-aligned disclosure, third-party verification). The share page can carry the audit label."],
];

const stage2EvidenceLibrary = [
  ["FACTOR_SOURCES", "Provenance for every default emission factor — source, publisher, year, URL, methodology, derivation basis."],
  ["FRAMEWORKS", "The standards the methodology rests on: GHG Protocol Corporate + Scope 3, SBTi, SCI / ISO 21031, Project Frame, additionality, rebound effect, ISO 14040/14044 LCA, GHG Protocol Product Standard."],
  ["BENCHMARKS", "Per-FTE × headcount peer ranges, sector-specific bands (SaaS, Hardware, F&B, Pet, Biotech), and funding-stage headcount defaults (Pre-seed through Growth)."],
  ["CARBON_PRICES", "EU ETS compliance price + EPA social cost of carbon — translates tonnes into a $-cost band (the cost-exposure tile)."],
  ["IMPACT_DIMENSIONS", "Energy, water, waste modeled (derived from the carbon model); land and biodiversity as a qualitative materiality flag."],
  ["CASE_PRECEDENTS", "Real, dated, cited precedents behind the risks raised (CSRD, California SB 253/261, the Jevons / rebound evidence base, greenwashing scrutiny)."],
  ["buildFactPack()", "Assembles the curated facts relevant to one assessment into a citation-ready block for the AI prompt. The AI cannot cite anything outside this pack."],
  ["GLOSSARY_DB", "Founder-facing term definitions the AI consults before answering terminology questions. Wired into the MCP <code>list_glossary_terms</code> tool."],
  ["BUSINESS_MODEL_OPTIONS", "Recognized business-model archetypes (Foundation Model / Heavy Compute is one of them — see 2.1.9). The MCP <code>list_business_models</code> tool returns this list."],
];

const stage2HonestyRules = [
  ["Source on every factor", "Every default factor names a real public source + URL + year. No internal estimates masquerading as data."],
  ["Modeled, never measured", "Default values are labelled <code>type: \"modeled\"</code>. The dashboard visibly distinguishes them from measured inputs and narrows the uncertainty band when the founder replaces them with their own data."],
  ["Benchmarks as ranges", "BENCHMARKS is a derived range (per-FTE × typical headcount), not a proprietary peer dataset. Each sector entry names its source URL."],
  ["Regulatory precedents move", "CASE_PRECEDENTS entries carry a status / date because regulation moves. The share page never claims a regulation is in force without a current date."],
  ["AI cannot invent", "The AI is constrained to cite only sources from buildFactPack(). Search queries and web sources are surfaced inline so the founder can verify every claim."],
  ["Defaults to 0 for handprint", "Handprint activities (avoided-grid, avoided-transport, avoided-material) start at 0 — the founder must supply a baseline before any positive claim counts."],
  ["No PII in prompts", "Founder notes pass through, but the AI prompt is built from the structured snapshot, not from raw free-text dumps that could leak account details."],
];

const stage2EvidenceFlow = [
  ["1. Snapshot", "<code>computeSnapshot()</code> produces a structured JSON footprint + handprint snapshot from the founder's inputs. Same function in the SPA and the Worker — see <code>worker/snapshot.js</code>."],
  ["2. Fact pack", "<code>buildFactPack()</code> filters FACTOR_SOURCES, FRAMEWORKS, BENCHMARKS, CASE_PRECEDENTS down to the entries relevant to the snapshot's profile and activities."],
  ["3. Prompt", "The fact pack is injected into the Gemini prompt alongside the snapshot. The schema and <code>responseSchema</code> constrain the model's output shape."],
  ["4. Grounding", "If the founder supplied a public website, the Worker fetches it behind SSRF guards and includes the extracted text. Google Search grounding turns on to pull current news and analogous incidents."],
  ["5. Output", "The AI briefing is returned with inline citations, each of which resolves to an entry in the fact pack. The founder can trace any claim back to the source."],
];

const stage2AuthSurface = [
  ["Sign up", "POST /api/signup — PBKDF2 (WebCrypto, 100k iterations) over a per-user salt. Sets a session cookie."],
  ["Log in", "POST /api/login — timing-safe comparison, session cookie set on success."],
  ["Log out", "POST /api/logout — clears the session cookie and the server-side session row."],
  ["Current account", "GET /api/me — returns the email of the logged-in user, or 401 if not."],
  ["Workspace state", "GET /api/state · PUT /api/state — load / save the per-user workspace JSON blob (the same shape the SPA holds in memory and localStorage)."],
];

const stage2InviteFlow = [
  ["Click invite link", "The visitor arrives at <code>/?invite=&lt;token&gt;</code>. The SPA detects <code>window.location.search</code> and sets <code>_inviteParam = true</code>."],
  ["Bypass auth gate", "Even if the visitor is logged in, the invite flow routes them to the public funnel — never straight into a dashboard. The invitation grants the free assessment, not access to someone else's workspace."],
  ["Start at onboarding", "<code>startInvitedAssessment()</code> forces <code>funnelStage = \"onboard\"</code>, shows a toast (\"You're invited — start with your free assessment.\"), and renders the wizard at step 1."],
  ["Same anonymous quota", "The invited visitor uses the same <code>anonymous_report_limits</code> path as a non-invited anonymous visitor. The invite does not raise the per-IP daily cap."],
  ["Optional sign-up after report", "After the report renders, the same account gate applies. The founder can sign up to save the snapshot — the invite does not auto-create an account."],
];

const stage2AuthStorage = [
  ["users", "id, email, password_hash, password_salt, created_at. PBKDF2(SHA-256) over the salt + supplied password."],
  ["sessions", "id, user_id, expires_at, created_at. The session cookie is the row id; lookup is by id, not email."],
  ["workspaces", "id, user_id, state_json, updated_at. The per-user state blob — same shape the SPA keeps in memory."],
  ["documents", "id, user_id, filename, size, r2_key, uploaded_at. Metadata only — the bytes live in R2."],
  ["report_history", "id, user_id, snapshot_json, visibility, share_token, created_at. Each saved snapshot is a row."],
  ["anonymous_report_limits", "day, subject_hash, count, updated_at. Per-IP daily quota; subject_hash is SHA-256(day + client IP)."],
  ["token_usage_logs", "id, user_id, prompt_tokens, completion_tokens, total_tokens, created_at. Feeds /api/admin/token-logs."],
];

const stage2FoundationModelProfile = [
  ["Trigger", "Founder selects \"Foundation Model / Heavy Compute\" in the business-model step, or the system auto-detects heavy-compute signals (large token spend, training-job cadence)."],
  ["Compute multiplier", "1000x on the default <code>compute</code> activity. A team of 10 at 8.5 tCO2e/yr default becomes 8,500 tCO2e/yr — the per-FTE SaaS baseline visibly mis-measures this cohort."],
  ["RLHF / Data Annotation workforce", "An explicit 25,000 tCO2e/yr baseline is added to the snapshot as a separate line, reflecting the distributed-workforce footprint of labeling and RLHF operations."],
  ["What it changes in the intake", "Cloud-spend and headcount inputs are emphasized. Hardware defaults are reduced. The Activities step surfaces compute, vendors, and travel as the dominant categories; logistics is suppressed by default."],
  ["What it changes in the report", "The report calls out the 1000x multiplier and the RLHF baseline explicitly. The peer benchmark uses the SaaS sector (the only benchmark in the library that includes AI compute at this scale) and labels the band as indicative."],
  ["What it does NOT change", "The +/- separation stays. The integrity gates still apply to the handprint side. The founder can still override the model with measured token spend and the multiplier falls away in favor of the measured value."],
];

const stage2MultiSectorProfiles = [
  ["SaaS / Cloud software", "1.5–4.0 tCO2e/FTE/yr — office operations and cloud compute emissions. Digital-first SMEs."],
  ["Hardware / Manufacturing", "15.0–45.0 tCO2e/FTE/yr — physical prototyping, outsourced Scope 3 supply chain."],
  ["Food and Beverage", "12.0–35.0 tCO2e/FTE/yr — supply-chain agriculture, raw ingredients, logistics, processing."],
  ["Pet Services", "8.0–24.0 tCO2e/FTE/yr — organic pet-waste processing, operations, retail logistics."],
  ["Biotech / Lab", "10.0–30.0 tCO2e/FTE/yr — high-power lab equipment, clinical waste, diagnostics shipping."],
  ["Foundation Model / Heavy Compute", "Computed via 1000x multiplier — see 2.1.9. Not a static range."],
  ["Hybrid", "Aggregated: takes the max-rate across matched sectors, combines their notes and source URLs."],
];

const stage2HybridRules = [
  ["Match", "The business-model free-text is scanned for keywords (hardware / device / physical, food / agri / farm / restaurant, pet / animal / dog / cat / veterinary, biotech / medical / lab, saas / software / cloud / digital)."],
  ["Aggregate", "Multiple matches → take the max low and max high across matched sectors. Combine the notes. The first matched sector's URL is the canonical citation."],
  ["Fallback", "No match → use the generic per-FTE range (1.5–4.0 tCO2e/FTE/yr). The founder is told the benchmark is generic and offered the business-model field to narrow it."],
  ["Surface", "The report cites the matched sector(s) on the peer-benchmark tile, the AI briefing, and the share card. Switching the business model in the dashboard re-runs the benchmark."],
];

const stage2AdminEndpoints = [
  ["GET /api/admin/stats", "Counts of users, workspaces, documents, report_history rows, plus total prompt / completion / total tokens across all users."],
  ["GET /api/admin/token-logs", "Most recent 100 token_usage_logs rows joined to users — operator-visible AI spend by user and date."],
];

const stage2AdminAuth = [
  ["Email-based gate", "A user is admin if <code>user.email.startsWith(\"admin@\")</code> or <code>user.email === \"rae@sociallab.com\"</code>. Implemented in <code>requireAdmin()</code> on the Worker."],
  ["Session-bound", "The admin check runs after the session lookup. An unauthenticated request gets 401, an authenticated non-admin gets 403, an admin gets the response."],
  ["No public client", "The admin dashboard is reachable only from the same SPA — it shows the JSON from /api/admin/stats and /api/admin/token-logs as a read-only console."],
  ["What it does not do", "No user impersonation, no report edits, no share-token generation. The admin view is observe-and-audit only; destructive actions stay in the Worker and are out of band for the SPA."],
];

const stage2AdminMetrics = [
  ["users", "Total signups. The growth signal; tracks whether the wedge is attracting new accounts."],
  ["workspaces", "Number of distinct workspace rows. Each user has one — the delta vs. users is the invite-only / no-save population."],
  ["documents", "Total uploaded documents across all users. With Phase B, this is expected to stay low — the UI no longer asks for uploads."],
  ["reports", "Total saved report snapshots. A proxy for engagement — saving means the founder came back to the dashboard and committed."],
  ["tokens (prompt / completion / total)", "Cumulative AI spend. The cost signal — confirms that anonymous-preview quotas and full-mode rate limits are doing their job."],
  ["token logs (per user, recent)", "The 100-row tail of token_usage_logs joined to users. The operator's view of which accounts are driving cost."],
];

const marketSignals = [
  ["Climate tech VC", "$40.5B invested in 2025, up roughly 8% YoY; about $255B cumulatively since 2020."],
  ["Carbon accounting software", "Estimated at $14.1B-$22.5B in 2025, with roughly 22% CAGR in the cited analyst range."],
  ["Regulatory pull", "California SB 253 pushes reporting down to suppliers; EU CSRD is weaker as a startup tailwind."],
  ["Validation proxy", "Watershed's $100M Series C at a $1.8B valuation is the clearest willingness-to-pay signal cited in the report."],
];

const impactChecks = [
  ["Baseline", "What would have happened without the solution?"],
  ["Displacement", "Did the clean output replace fossil output or merely add supply?"],
  ["Additionality", "Would the avoided claim still exist if the solution had not shipped?"],
  ["Marginal signal", "Does the model use the plant that actually ramps, not a flattering average?"],
  ["Rebound", "Does the cleaner or cheaper path induce more total consumption?"],
];

function Progress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return <div className="reading-progress" style={{ transform: `scaleX(${progress})` }} />;
}

function ChapterLabel({ number, children }) {
  return <div className="chapter-label"><span>{number}</span><p>{children}</p></div>;
}

function PageIntro({ eyebrow, title, summary, links = [] }) {
  return (
    <header className="report-page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{summary}</p>
      {links.length > 0 && (
        <div className="report-next-links">
          {links.map(([href, label]) => <a key={href} href={href}>{label} <span>→</span></a>)}
        </div>
      )}
    </header>
  );
}

function FieldworkFigure({ src, alt, caption, label = "Fig.", compact = false }) {
  return (
    <figure className={`prototype-figure${compact ? " prototype-figure--compact" : ""}`}>
      <div className="figure-image">
        <img src={src} alt={alt} />
      </div>
      <figcaption>{label && <span>{label}</span>}<p>{caption}</p></figcaption>
    </figure>
  );
}

function IntroPage() {
  return (
    <section className="report-section" id="intro">
      <ChapterLabel number="0">Overview</ChapterLabel>
      <div className="report-document">
        <PageIntro
          eyebrow="Climate Goal Platform research report"
          title="The report turns GTR into a climate startup product"
          summary="The research report is the core document in the archive. It explains why the project narrowed from broad startup climate support into a climate startup +/- impact dashboard, why that wedge is credible, and what has to be tested before the product expands."
          links={[
            ["/gtr/docs/fieldwork-report/", "Fieldwork report"],
            ["/gtr/docs/stage-1/", "Stage 1 PRD"],
            ["/gtr/slides/climate-goal-platform/", "Product deck"],
          ]}
        />

        <nav className="report-contents" aria-label="Research report contents">
          <p>In this report</p>
          <a href="#research-summary"><span>0</span>Executive summary</a>
          <a href="#research-direction"><span>1</span>The rescoped direction</a>
          <a href="#research-market"><span>2</span>Why climate startups first</a>
          <a href="#research-model"><span>3</span>The +/- impact model</a>
          <a href="#research-integrity"><span>4</span>Positive impact, done honestly</a>
          <a href="#research-product"><span>5</span>Product overview</a>
          <a href="#research-next"><span>6</span>Research still needed</a>
        </nav>

        <section className="report-chapter" id="research-summary">
          <span className="report-number">0</span>
          <h2>Executive summary</h2>
          <p className="report-lead">Climate Goal Platform is a product direction for making a climate startup's environmental impact a live, owned, and credible operating surface rather than an annual slide.</p>
          <p>The direction has been rescoped. The MVP narrows to climate startups and a two-sided (+/-) net impact dashboard, where net impact equals positive handprint (avoided and enabled emissions) minus negative footprint (Scope 1, 2, 3). The earlier broad framing becomes the stretch tier, reached only after the rigorous climate-first core works.</p>
          <p>The report also makes a strategic claim: climate startups are the right wedge because, for them, impact is not a side report. It is the investment thesis. The buyer already underwrites impact and already needs to explain it to others.</p>
          <aside className="report-note"><b>Primary premise</b><p>The work is not about making another dashboard pretty. It is about turning impact into something that can be measured, checked, and used operationally without collapsing the accounting logic.</p></aside>
        </section>

        <section className="report-chapter" id="research-direction">
          <span className="report-number">1</span>
          <h2>The rescoped direction</h2>
          <p>The earlier Social Lab direction was a hands-on advisory and transition service: measure a startup's climate impact, build a reduction strategy, support ongoing management, and run nature-based founder workshops, with Climate Brick embedded in an AI Capital Navigator. That model is valuable, but it does not scale past one-to-one engagements.</p>
          <p>The new direction turns the repeatable core into a product, and sequences it: climate startups first, because that is where the two-sided model is non-negotiable, the integrity bar is highest, and a paying, sophisticated buyer already exists. Broad tech startups come later.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Before</th><th>Now</th><th>Implication</th></tr></thead>
              <tbody>
                <tr><td>One-to-one consulting and workshops</td><td>Self-serve gamified dashboard</td><td>The value has to survive without a human service layer.</td></tr>
                <tr><td>Broad startup climate awareness</td><td>Climate startups first</td><td>The report chooses the buyer who already cares most about the claim.</td></tr>
                <tr><td>Climate Brick as the model</td><td>Climate Brick as a reference shelf</td><td>The product needs its own method, not a borrowed one.</td></tr>
                <tr><td>Impact as adjacent context</td><td>Impact as operating surface</td><td>The dashboard should be weekly, owned, and credible.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-chapter" id="research-market">
          <span className="report-number">2</span>
          <h2>Why climate startups first</h2>
          <p>The report says the market is large, funded, and pressured from below. Climate tech VC, carbon accounting software, and regulatory pull all point in the same direction, but the report refuses to overstate certainty. It keeps the argument at the level of a credible wedge rather than a guaranteed market pull.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Reason</th><th>Report logic</th></tr></thead>
              <tbody>
                <tr><td>The + side is the pitch</td><td>A climate startup exists to avoid emissions, so the positive claim deserves revenue-level rigor.</td></tr>
                <tr><td>The - side is ignored</td><td>Cloud, AI compute, hardware, travel, and supply chain emissions are usually missing from the story.</td></tr>
                <tr><td>The buyer already exists</td><td>A climate-focused VC underwrites impact, so it needs a defensible net number, not a slogan.</td></tr>
              </tbody>
            </table>
          </div>
          <aside className="report-note report-note-yellow"><b>Timing note</b><p>The market is large and funded, but the report treats the numbers as ranges and the regulation as uneven. The thesis is not that everyone is forced to buy this now. It is that the wedge is credible and the timing is moving in the right direction.</p></aside>
        </section>

        <section className="report-chapter" id="research-model">
          <span className="report-number">3</span>
          <h2>The +/- impact model</h2>
          <p className="report-lead">Net impact is presented as two ledgers and a clearly labeled derived figure.</p>
          <p>The report's accounting logic is strict. Footprint is the inventory of actual emissions. Handprint is the comparative estimate of avoided or enabled emissions. Net is only a context number. This separation exists so the dashboard can stay honest even when the model is useful.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Side</th><th>What it captures</th><th>Accounting basis</th></tr></thead>
              <tbody>
                <tr><td>- Footprint</td><td>The startup's own emissions: Scope 1 direct, Scope 2 energy, Scope 3 value chain</td><td>Inventory: what you actually emitted</td></tr>
                <tr><td>+ Handprint</td><td>Emissions the solution helps others avoid versus a reference scenario</td><td>Comparative: what would have happened otherwise</td></tr>
                <tr><td>= Net</td><td>A context figure shown alongside, not instead of, the inventory</td><td>Derived, with uncertainty bands</td></tr>
              </tbody>
            </table>
          </div>
          <aside className="report-note"><b>Non-negotiable</b><p>Different accounting bases must stay separate. The report explicitly says the dashboard should never net naively.</p></aside>
        </section>

        <section className="report-chapter" id="research-integrity">
          <span className="report-number">4</span>
          <h2>Positive impact, done honestly</h2>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Test</th><th>Question the dashboard must answer</th></tr></thead>
              <tbody>
                {impactChecks.map(([test, question]) => (
                  <tr key={test}><td>{test}</td><td>{question}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>Why the gate matters: in the absence of additionality, quantifying avoided emissions amounts to multiplying by zero. The report treats inflated positive claims as the default failure mode, not an edge case.</p>
          <aside className="report-note report-note-yellow"><b>Integrity gate</b><p>The product should ask for baseline, displacement, additionality, marginal signal, and rebound before the positive side is shown as meaningful.</p></aside>
        </section>

        <section className="report-chapter" id="research-product">
          <span className="report-number">5</span>
          <h2>Product overview</h2>
          <p>The product is a weekly operating surface. A founder enters the company, the system estimates footprint and proposed handprint, integrity gates prompt for baseline and additionality, the team chooses goals, and the company publishes a share page with uncertainty intact.</p>
          <p>The report describes the implementation as a sequence: map the actual company activity, rank what matters, measure by tier, gate the positive claim, then monitor on the cadence each metric deserves. The point is to make the method viable enough to start and reliable enough for a climate VC.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Flow step</th><th>What happens</th></tr></thead>
              <tbody>
                {productFlow.map(([step, detail]) => (
                  <tr key={step}><td>{step}</td><td>{detail}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Module</th><th>Purpose</th></tr></thead>
              <tbody>
                <tr><td>Impact ledger</td><td>Shows + handprint and - footprint side by side.</td></tr>
                <tr><td>Integrity gates</td><td>Baseline, displacement, additionality, marginal signal, rebound.</td></tr>
                <tr><td>Freshness layer</td><td>Metered versus modeled values, with cadence and freshness dates.</td></tr>
                <tr><td>Goal board</td><td>Owned actions, deadlines, and evidence points.</td></tr>
                <tr><td>Progress game</td><td>Levels and evidence tied to integrity, not vanity points.</td></tr>
                <tr><td>Share page</td><td>Investor- and LP-ready view that preserves uncertainty.</td></tr>
              </tbody>
            </table>
          </div>
          <aside className="report-note report-note-yellow"><b>Product summary</b><p>The report's goal is not to define the whole company on day one. It is to make the core claim testable, measurable, and worth repeating weekly.</p></aside>
        </section>

        <section className="report-chapter" id="research-next">
          <span className="report-number">6</span>
          <h2>Research still needed</h2>
          <ul>
            <li>Whether people can monitor both handprint and footprint without confusion.</li>
            <li>Whether the dashboard is usable in under 15 minutes of intake.</li>
            <li>Whether the share page is credible in diligence.</li>
            <li>Whether the weekly operating loop actually sticks.</li>
            <li>Whether the positive side can be kept honest as the product expands.</li>
            <li>Whether the cross-device promise stays coherent when the product moves from desktop to headset to lighter wearables.</li>
            <li>Whether AI-assisted labels and clusters remain source-linked and reversible in practice.</li>
          </ul>
          <div className="report-next-links">
            <a href="/gtr/docs/fieldwork-report/">Open the fieldwork report <span>→</span></a>
            <a href="/gtr/docs/stage-1/">Read Stage 1 PRD <span>→</span></a>
          </div>
        </section>
      </div>
    </section>
  );
}

function DocsOverviewPage() {
  return (
    <section className="report-section" id="docs">
      <ChapterLabel number="02">Docs</ChapterLabel>
      <div className="report-document">
        <PageIntro
          eyebrow="Documentation index"
          title="The docs are where the product logic lives"
          summary="These pages explain the project direction in report form: the fieldwork report, the Stage 1 PRD, and the Stage 2 PRD. The research report lives in Overview. The point is not to compress them into a pitch, but to preserve the reasoning."
          links={[
            ["/gtr/", "Research report"],
            ["/gtr/docs/fieldwork-report/", "Fieldwork report"],
            ["/gtr/docs/stage-1/", "Stage 1 PRD"],
            ["/gtr/docs/stage-2/", "Stage 2 PRD"],
          ]}
        />

        <section className="report-chapter" id="docs-scope">
          <span className="report-number">2.0</span>
          <h2>Scope and method</h2>
          <p className="report-lead">The docs turn a messy project trail into a clear sequence of decisions.</p>
          <p>The fieldwork report documents five prototype testing sessions for a climate impact platform for startups. The research report establishes the rationale for the climate startup wedge. Stage 1 defines the product boundary. Stage 2 defines the extension path. Together they show where the project starts, what it must prove, and what remains deliberately out of scope.</p>
        </section>

        <section className="report-chapter" id="docs-map">
          <span className="report-number">2.1</span>
          <h2>Documentation map</h2>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Document</th><th>Main use</th><th>Reading cue</th></tr></thead>
              <tbody>
                <tr><td>Fieldwork report</td><td>Five founder-role prototype sessions (Amali, Caroline, Josh, Ted, Brian).</td><td>Storyboard-led journey, Assessment 1/2, Report 1/2, and dashboard hierarchy.</td></tr>
                <tr><td>Research report</td><td>Explains the rescoped direction and the + / - model.</td><td>Why this product exists.</td></tr>
                <tr><td>PRD Stage 1</td><td>Defines the MVP and the first shippable boundary.</td><td>What gets built first.</td></tr>
                <tr><td>PRD Stage 2</td><td>Generalization, customization, and follow-up.</td><td>What comes after the wedge works.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-chapter">
          <span className="report-number">2.2</span>
          <h2>What the docs need to prove</h2>
          <ul>
            <li>The project should stay focused on climate startups before expanding outward.</li>
            <li>The dashboard should keep positive and negative impact separate.</li>
            <li>The workflow should be operational enough to use weekly, not just read once.</li>
            <li>Future flexibility should come from data and rules, not from a vague redesign.</li>
          </ul>
        </section>

        <section className="report-chapter">
          <span className="report-number">2.3</span>
          <h2>Go deeper</h2>
          <div className="report-next-links">
            <a href="/gtr/docs/fieldwork-report/">Fieldwork report <span>→</span></a>
            <a href="/gtr/">Read the report <span>→</span></a>
            <a href="/gtr/docs/stage-1/">Stage 1 PRD <span>→</span></a>
            <a href="/gtr/docs/stage-2/">Stage 2 PRD <span>→</span></a>
          </div>
        </section>
      </div>
    </section>
  );
}

function FieldworkReportPage() {
  return (
    <section className="report-section" id="fieldwork-report">
      <ChapterLabel number="1.2">First Prototype / Fieldwork Report</ChapterLabel>
      <div className="report-document">
        <PageIntro
          eyebrow="Fieldwork week · prototype user testing"
          title="Prototype testing for a climate impact platform for startups"
          summary="The journey storyboard defined the founder experience first. From it, the team built and tested two A/B pairs—Assessment 1 vs 2 and Report 1 vs 2—plus a dashboard concept for continued use."
          links={[
            ["/gtr/docs/fieldwork-report/feedback/", "Presentation feedback"],
            ["/gtr/", "Research report"],
            ["/gtr/docs/stage-1/", "Stage 1 PRD"],
          ]}
        />

        <nav className="report-contents" aria-label="Fieldwork report contents">
          <p>In this report</p>
          <a href="#fieldwork-summary"><span>0</span>Executive summary</a>
          <a href="#fieldwork-raw"><span>1</span>Storyboard to prototypes</a>
          <a href="#fieldwork-testing"><span>2</span>Testing Process</a>
          <a href="#fieldwork-project"><span>3</span>What we learned</a>
          <a href="#fieldwork-direction"><span>4</span>Changes &amp; Future Direction</a>
          <a href="#fieldwork-method"><span>5</span>Method and evidence</a>
          <a href="#fieldwork-participants"><span>6</span>Participant records</a>
          <a href="#fieldwork-materials"><span>7</span>Test materials</a>
          <a href="#fieldwork-findings"><span>8</span>Aggregated findings</a>
        </nav>

        <section className="report-chapter" id="fieldwork-summary">
          <span className="report-number">0</span>
          <h2>Executive summary</h2>
          <p className="report-lead">Fieldwork week deliverable: five prototype sessions for a climate impact platform for startups.</p>
          <p>The team began with an eight-stage journey storyboard: discovery at demo day, referral, mobile entry, assessment, instant report, dashboard use, team access, and extended use. The prototypes were built around that journey. Assessment 1 and Assessment 2 tested two intake structures; Report 1 and Report 2 tested two result formats; the dashboard explored what continued use could look like after the instant report. Five participants completed the founder-role walkthrough, and their feedback was captured in the provided transcript.</p>
          <aside className="report-note"><b>Study boundary</b><p>All five participants were asked to act as a startup founder. Ted was the only actual founder; the other four brought technical, investment, peer-design, and accessibility perspectives to the founder scenario. The study supports prototype and comprehension decisions, not product-market-fit or calculation-accuracy claims.</p></aside>
          <div className="report-next-links">
            <a href="/gtr/docs/fieldwork-report/slides/">Present fieldwork slides <span>→</span></a>
            <a href="/gtr/docs/fieldwork-report/feedback/">Presentation feedback <span>→</span></a>
            <a href="/gtr/">Research report <span>→</span></a>
          </div>
        </section>

        <section className="report-chapter" id="fieldwork-raw">
          <span className="report-number">1</span>
          <h2>Storyboard to prototypes</h2>
          <p className="report-lead">The storyboard came first. Each prototype artifact tested a specific moment or decision in that journey.</p>

          <h3>1. Storyboard defined the experience</h3>
          <p><code>storyboard.jpeg</code> mapped the founder journey from initial awareness through assessment, instant results, dashboard use, team access, and longer-term use. It gave the sessions a shared scenario and determined which prototype moments needed to be built.</p>
          <FieldworkFigure
            src="/assets/images/gtr/fieldwork/user-journey-storyboard.jpg"
            alt="Eight-panel founder journey storyboard"
            caption="storyboard.jpeg: discovery at demo day → referral → mobile assessment → instant report → dashboard → team access → extended use."
            label="Storyboard"
          />

          <h3>2. Two A/B pairs tested the key transitions</h3>
          <p>The first pair tested how a founder completes the free impact assessment: Assessment 1 (A) versus Assessment 2 (B). The investment-stage paper, <code>assessment1-stage.jpeg</code>, belongs to Assessment 1 (A). The second pair tested how the result should be communicated: Report 1 (A) versus Report 2 (B).</p>

          <h3>Artifact inventory and A/B mapping</h3>
          <div className="report-table-scroll">
            <table className="report-table report-table-wide">
              <thead><tr><th>Sequence</th><th>Original file</th><th>Purpose in the journey</th></tr></thead>
              <tbody>
                {fieldworkArtifacts.map(([role, file, detail]) => (
                  <tr key={role}><td>{role}</td><td><code>{file}</code></td><td>{detail}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p><code>testing1.jpeg</code> through <code>testing6.jpeg</code> document the prototype sessions. The walkthrough feedback was captured in the provided transcript.</p>

          <h3>Prototype sequence</h3>
          <p>Paper and screen prototypes shown in sessions. Sample company in printed materials: pre-seed hardware and clean-energy startup.</p>
          <div className="prototype-grid">
            <FieldworkFigure
              src="/assets/images/gtr/fieldwork/onboarding-sheets.jpg"
              alt="Continuous handwritten free impact assessment"
              caption="2A · Assessment 1 / assessment1.jpeg: continuous long-form assessment."
              label="Fig. 2A"
            />
            <FieldworkFigure
              src="/assets/images/gtr/fieldwork/onboarding-flow-4up.jpg"
              alt="Four hand-drawn screens for Assessment 2"
              caption="2B · Assessment 2 / assessment2-mobile.jpeg: four-screen mobile flow with progress, Back, and Next controls."
              label="Fig. 2B"
            />
            <FieldworkFigure
              src="/assets/images/gtr/fieldwork/assessment-report-print.jpg"
              alt="Printed two-page instant impact assessment report"
              caption="3A · Report 1 / report1-information.jpeg: information-led result with footprint, handprint, hotspots, comparison, cost exposure, methodology, and share actions."
              label="Fig. 3A"
            />
            <FieldworkFigure
              src="/assets/images/gtr/fieldwork/assessment-report-sketch.jpg"
              alt="Visual infographic instant impact report"
              caption="3B · Report 2 / report2-infographic.jpeg: infographic result with metric cards, gauge, and charts."
              label="Fig. 3B"
            />
            <FieldworkFigure
              src="/assets/images/gtr/fieldwork/dashboard-sketch.jpg"
              alt="Hand-drawn dashboard overview sketch"
              caption="4 · dashboard.jpeg: continued-use concept with footprint, handprint, derived net, maturity, goals, milestones, and projection."
              label="Fig. 4"
            />
          </div>

        </section>

        <section className="report-chapter" id="fieldwork-testing">
          <span className="report-number">2</span>
          <h2>Testing Process</h2>
          <p className="report-lead">Each session began with the storyboard scenario, then moved through Assessment 1/2, Report 1/2, and the dashboard concept while participants thought aloud.</p>

          <h3>Who did you test with?</h3>
          <div className="report-table-scroll">
            <table className="report-table report-table-wide">
              <thead><tr><th>Participant</th><th>Context</th><th>Role in test</th></tr></thead>
              <tbody>
                {testParticipants.map(([name, context, role]) => (
                  <tr key={name}><td>{name}</td><td>{context}</td><td>{role}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>All five participants were instructed to move through the prototypes as a startup founder. Ted contributed direct founder experience; Amali, Caroline, Josh, and Brian contributed role-play feedback shaped by their own professional or design expertise.</p>

          <h3>What mistakes did you make while testing?</h3>
          <ul>
            <li>The test asked for sensitive documents before clearly showing the participant benefit. This confounded trust in the concept with usability of the form.</li>
            <li>Terms such as net impact, maturity, projection, and milestones required interviewer explanation. The facilitator became part of the interface.</li>
            <li>The report and dashboard used inconsistent illustrative emissions values, adding noise to a hierarchy test.</li>
            <li>Each session covered the full journey plus Assessment 1/2, Report 1/2, the dashboard, and sharing prompts. This produced breadth but limited depth on each A/B question.</li>
            <li>Only one participant was an actual startup founder. Role-play feedback and direct founder feedback should be analyzed separately.</li>
          </ul>

          <h3>What worked well while testing?</h3>
          <ul>
            <li>Internal walkthroughs caught sequencing and script problems before stakeholder sessions.</li>
            <li>Starting with the storyboard gave every participant the same founder journey before they compared individual screens.</li>
            <li>Think-aloud exposed trust, comprehension, sharing, and accessibility concerns that task completion alone would have missed.</li>
            <li>Low-fidelity artifacts kept iteration inexpensive and made it possible to compare alternative structures in the same session.</li>
            <li>Using hypothetical startup contexts exposed questions worth testing directly with founders in the next round.</li>
            <li>Repeated issues were separated from one-off requests, creating a clearer threshold for redesign.</li>
          </ul>
          <aside className="report-note"><b>Testing Process conclusion</b><p>The storyboard created a coherent founder scenario, and the two numbered A/B pairs produced comparable feedback. The main weaknesses were scope and control: too many artifacts in one session, only one actual founder, inconsistent sample values, and terminology that required facilitator explanation.</p></aside>
        </section>

        <section className="report-chapter" id="fieldwork-project">
          <span className="report-number">3</span>
          <h2>What we learned</h2>
          <p className="report-lead">The sessions identified the conditions under which the concept is worth testing again. They did not validate a product or market.</p>

          <h3>What did you learn about testing?</h3>
          <ul>
            <li>Concept value, trust, and interface usability cannot be interpreted as separate layers when participants encounter them at the same time.</li>
            <li>Low-fidelity testing is sufficient for identifying blockers, but preference comparisons at n=5 remain directional.</li>
            <li>Cross-participant repetition is more useful than isolated enthusiasm. Repeated blockers should drive the next prototype; one-off feature requests should enter a backlog.</li>
            <li>Founder role-play can reveal usability and comprehension friction, but founder-specific behavior must be followed up with more actual founders.</li>
          </ul>

          <h3>What did you learn from your stakeholders?</h3>
          <ul>
            <li>Ted's founder perspective made the trust problem concrete: the value of the assessment must be clear before requesting a pitch deck, accounts, or other sensitive material.</li>
            <li>Amali's data perspective exposed unclear product scope, undefined dashboard terms, and the need to pair visualization with explanation.</li>
            <li>Caroline's investment perspective favored preset inputs, Assessment 2's guided flow, Report 2's visual format, and broader company research.</li>
            <li>Josh's peer-design perspective favored Assessment 1's easy review, Report 2's readability, selective sharing, and a vertical dashboard hierarchy.</li>
            <li>Brian's accessibility perspective identified required-field labeling, comprehension, form hierarchy, and trusted data-entry alternatives as baseline requirements.</li>
          </ul>

          <h3>What ideas were validated from testing?</h3>
          <p>The sessions directionally validated the following design decisions for the next prototype:</p>
          <ul>
            <li>Keep the storyboard-led sequence: discover → assess → receive an instant report → return to a dashboard.</li>
            <li>Use a guided assessment with visible progress and preset choices, while preserving easy review of earlier answers.</li>
            <li>Use Report 2's infographic structure as the first layer and Report 1's explanation and methodology as the detail layer.</li>
            <li>Keep footprint and handprint separate, but define both in plain language before showing a derived net value.</li>
            <li>Make the instant report the first payoff; position the dashboard as continued use rather than the first result.</li>
          </ul>
          <aside className="report-note"><b>What we learned conclusion</b><p>The winning direction is not one untouched variant. It is a synthesis: Assessment 2's guided flow with Assessment 1's visibility and revisability, plus Report 2's visual hierarchy with Report 1's explanatory depth.</p></aside>
        </section>

        <section className="report-chapter" id="fieldwork-direction">
          <span className="report-number">4</span>
          <h2>Changes &amp; Future Direction</h2>
          <p className="report-lead">The next round should narrow the question, reduce trust risk, and test comprehension with a more representative sample.</p>

          <h3>What challenges do you still face?</h3>
          <ul>
            <li>The assessment interaction still needs confirmation: continuous review versus step-by-step guidance.</li>
            <li>The prototype has not tested real data entry, real files, calculation accuracy, or trust in a deployed system.</li>
            <li>Illustrative emissions values are not validated source data and should not be interpreted as product accuracy.</li>
            <li>Core terms still need to be understood without facilitator explanation.</li>
            <li>The sample is small and mixed, with only one target startup founder.</li>
          </ul>

          <h3>Any major changes or pivots from their feedback?</h3>
          <ul>
            <li>Keep the storyboard sequence but make the instant report—not document upload—the first visible payoff.</li>
            <li>Replace default file upload with manual aggregate fields; reserve files for an explicitly trusted path.</li>
            <li>Combine Assessment 2's step-by-step guidance with Assessment 1's visible scope and easy answer review.</li>
            <li>Combine Report 2's visual overview with Report 1's explanation, methodology, and evidence detail.</li>
            <li>Move the dashboard to follow-up use after the instant report.</li>
            <li>Use a vertical dashboard hierarchy with goals and milestones grouped near the top.</li>
            <li>Tailor intake questions to the participant's business model.</li>
            <li>Default results to private; treat public sharing as an explicit, selective action.</li>
          </ul>

          <h3>What are your next steps based on feedback?</h3>
          <ol>
            <li>Build the hybrid interactive flow: value proposition → guided assessment with review → visual report with expandable detail.</li>
            <li>Run separate tests for terminology comprehension, document trust, and assessment navigation instead of combining every question in one session.</li>
            <li>Recruit more startup founders and compare their behavior with the founder-role feedback from this round.</li>
            <li>Test accessibility and terminology without facilitator assistance.</li>
            <li>After comprehension is stable, test real-data workflows and calculation credibility.</li>
          </ol>
          <aside className="report-note"><b>Changes &amp; Future Direction conclusion</b><p>The next prototype should be a narrower hybrid, not a larger feature set. Its job is to prove that founders understand the value, trust the data request, complete the assessment without help, and understand the visual result before the dashboard expands.</p></aside>
          <div className="report-next-links">
            <a href="/gtr/docs/fieldwork-report/slides/">Present fieldwork slides <span>→</span></a>
            <a href="/gtr/docs/stage-1/">Stage 1 PRD <span>→</span></a>
          </div>
        </section>

        <section className="report-chapter" id="fieldwork-method">
          <span className="report-number">5</span>
          <h2>Method and evidence</h2>
          <p className="report-lead">Think-aloud prototype sessions during fieldwork week.</p>
          <div className="report-table-scroll">
            <table className="report-table report-table-wide">
              <thead><tr><th>Dimension</th><th>Record</th></tr></thead>
              <tbody>
                <tr><td>Sequence</td><td>Internal team runs first; stakeholder sessions after internal kinks are addressed.</td></tr>
                <tr><td>Participants</td><td>5 (Amali, Caroline, Josh, Ted, Brian). All were instructed to act as startup founders; Ted was the only actual founder.</td></tr>
                <tr><td>Format</td><td>Interviewer-led founder-role walkthrough and think-aloud. The storyboard established the scenario; participants then compared Assessment 1/2 and Report 1/2 before reviewing the dashboard.</td></tr>
                <tr><td>Materials</td><td>Journey storyboard (<code>storyboard.jpeg</code>); Assessment 1 (<code>assessment1.jpeg</code> and <code>assessment1-stage.jpeg</code>); Assessment 2 (<code>assessment2-mobile.jpeg</code>); Report 1 (<code>report1-information.jpeg</code>); Report 2 (<code>report2-infographic.jpeg</code>); dashboard (<code>dashboard.jpeg</code>); session photos (<code>testing1.jpeg</code>–<code>testing6.jpeg</code>); and the provided transcript.</td></tr>
                <tr><td>Test objectives</td><td>Intake friction, document sensitivity, +/- comprehension, report readability, dashboard hierarchy, stated willingness to share, reaction to overall project concept.</td></tr>
                <tr><td>Iteration rule</td><td>Small prototype updates allowed after each session. Specific headline or CTA variants require multiple participants before a decision.</td></tr>
                <tr><td>Change threshold</td><td>Single-participant red flags held until replicated. Pattern-level red flags trigger redesign of what is tested and how.</td></tr>
                <tr><td>Evidence status</td><td>Exploratory and directional. Suitable for prototype, copy, and follow-up research decisions; not product-market-fit or calculation validation.</td></tr>
              </tbody>
            </table>
          </div>
          <h3>Testing protocol</h3>
          <ul>
            <li>Run sessions with each other before stakeholder sessions. Resolve flow and script issues internally first.</li>
            <li>Record reactions to the overall project concept, not only UI task completion.</li>
            <li>Apply minor prototype edits between sessions. Do not treat one session as final for headline/CTA decisions without repetition across participants.</li>
            <li>Do not change the test plan based on one negative session alone.</li>
            <li>Change the test plan when the same issue appears across multiple participants.</li>
          </ul>
        </section>

        <section className="report-chapter" id="fieldwork-participants">
          <span className="report-number">6</span>
          <h2>Participant records</h2>
          <p className="report-lead">Participant feedback organized by session. All participants used a founder-role scenario; Ted was the only actual founder.</p>
          <div className="report-table-scroll">
            <table className="report-table report-table-wide">
              <thead><tr><th>Participant</th><th>Context</th><th>Role</th></tr></thead>
              <tbody>
                {testParticipants.map(([name, context, role]) => (
                  <tr key={name}><td>{name}</td><td>{context}</td><td>{role}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Transcript summary by participant and topic</h3>
          <p>The transcript is summarized here by topic; detailed session notes follow.</p>
          <div className="report-table-scroll">
            <table className="report-table report-table-wide">
              <thead><tr><th>Participant</th><th>Topic</th><th>Observation</th></tr></thead>
              <tbody>
                {sessionObservations.map(([name, topic, observation]) => (
                  <tr key={`${name}-${topic}-${observation.slice(0, 24)}`}><td>{name}</td><td>{topic}</td><td>{observation}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Amali</h3>
          <p>Data engineer met at a networking event. Role-played a founder and contributed an external technical and data perspective.</p>
          <ul>
            <li>Assessment 1/2: preferred Assessment 2, the shorter step-by-step mobile flow. Requested a clear end state on the final step.</li>
            <li>Report 1/2: recommended combining Report 2's graphs and visualization with supporting explanation from Report 1.</li>
            <li>Dashboard: milestones read as confusing. Asked what impact projection and the milestone diagram mean. Requested leaderboard and peer comparison (what other startups are doing and how they are achieving).</li>
            <li>Product scope: asked whether product is an app. Stated what the product does is not clear. Asked whether audience is climate-only, environment-related, or finance companies.</li>
            <li>Overall: stated idea is good and the project could be improved.</li>
          </ul>

          <h3>Caroline</h3>
          <p>Investment analyst. Role-played a founder while reviewing the concept through an investor and company-evaluation lens.</p>
          <ul>
            <li>Assessment 1/2: used a startup scenario, asked whether Pre-Seed includes accelerators and incubators, and preferred preset options over typing. Preferred Assessment 2's Back/Next flow over Assessment 1's continuous layout.</li>
            <li>Documents: raised stealth-mode concern for pitch deck and accounts at early stage. Stated early-stage founders are cautious about competitors and sharing business ideas.</li>
            <li>Footprint/handprint: card purpose was unclear initially. The proxy context used transport avoidance through remote work; hardware and logistics examples did not fit the SaaS scenario.</li>
            <li>Report 1/2: preferred Report 2, the infographic variation.</li>
            <li>Dashboard: assessment layout preferred over dashboard layout. Net impact and maturity levels 1-5 required interviewer explanation.</li>
            <li>Audience: suggested interviewing bigger companies through university network; noted larger environmental footprint and reporting requirements.</li>
          </ul>

          <h3>Josh</h3>
          <p>CCA Interaction Design student. Role-played a founder and contributed a peer-design perspective.</p>
          <ul>
            <li>Assessment 1/2: preferred Assessment 1's continuous flow if step count and time estimate were shown at the start. The continuous layout made answers easier to revisit.</li>
            <li>Report 1/2: preferred Report 2's infographic direction and found Report 1 difficult to parse.</li>
            <li>Sharing: in the founder scenario, would not share a high-emissions result publicly and considered a full LinkedIn report excessive.</li>
            <li>Dashboard: four-card horizontal layout read as messy; recommended vertical stack (overview, then goals, then milestones).</li>
          </ul>

          <h3>Ted</h3>
          <p>Startup founder. Participated as the only direct target-audience representative in this round.</p>
          <ul>
            <li>Value proposition: asked what he gets from completing the form; stated he would stop before finishing. Uploading pitch deck stated as IP risk without clear upside.</li>
            <li>Business model auto-detect: stated system cannot infer business model from company name or URL alone.</li>
            <li>Documents: one-person/tiny teams lack data to upload; larger teams still hesitant on sensitive files.</li>
            <li>SaaS impact: stated primary cost is cloud compute and AI credits; limited levers at early stage. Suggested token-usage observability instead of generic footprint checklist.</li>
          </ul>

          <h3>Brian</h3>
          <p>Accessibility Lead at Superhuman. Role-played a founder while reviewing the prototype through an accessibility expert lens.</p>
          <ul>
            <li>Accessibility: asterisk-only required fields fail basic accessibility; use visible [Required] text.</li>
            <li>Labels: business model label unclear; recent accounts and pitch deck read as sensitive. Suggested manual numeric fields (e.g. monthly AI/cloud spend) instead of document upload.</li>
            <li>Assessment 1/2: the long form did not invite investment; suggested previewing the output after step 1.</li>
            <li>Report 1/2: Report 2 was easier to understand, but the benefit of completing the assessment remained unclear. Suggested correlating cost reduction with impact.</li>
            <li>Metrics: requested travel spend and website carbon (deploy/load impact) in addition to emissions.</li>
            <li>Dashboard: layout dense. Recommended milestones and climate goals at top; maturity and status metrics at bottom; combine goals and milestones sections.</li>
            <li>Distribution: suggested incubator or investor partnership so document sharing occurs inside trusted context.</li>
            <li>Audience: noted larger companies may yield more insight than early startups (legal reporting requirements).</li>
          </ul>
        </section>

        <section className="report-chapter" id="fieldwork-materials">
          <span className="report-number">7</span>
          <h2>Test materials</h2>
          <p>Materials shown across sessions. Sample company in printed materials: pre-seed hardware and clean-energy startup, FTE-scaled modeled estimate.</p>

          <h3>Journey storyboard — built first</h3>
          <p>The storyboard established the founder scenario before the interface variants were made. It connected discovery, assessment, instant results, dashboard use, team access, and extended use into one testable journey.</p>
          <FieldworkFigure
            src="/assets/images/gtr/fieldwork/user-journey-storyboard.jpg"
            alt="Hand-drawn eight-panel user journey storyboard from demo day awareness through assessment, report sharing, dashboard use, and extended use"
            caption="storyboard.jpeg: eight-stage founder journey used to define the Assessment 1/2, Report 1/2, and dashboard prototypes."
          />
          <div className="report-table-scroll">
            <table className="report-table report-table-wide">
              <thead><tr><th>Stage</th><th>Moment</th><th>Description</th></tr></thead>
              <tbody>
                {journeyStages.map(([stage, moment, detail]) => (
                  <tr key={`${stage}-${moment}`}><td>{stage}</td><td>{moment}</td><td>{detail}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Assessment 1 (A) / Assessment 2 (B)</h3>
          <p><b>Assessment 1 (A)</b> used the continuous/long-form layout in <code>assessment1.jpeg</code>. Its investment-stage paper, <code>assessment1-stage.jpeg</code>, supplied the Pre-Seed, Seed, Series A, and Series B+ choices. <b>Assessment 2 (B)</b> used the four-screen mobile flow in <code>assessment2-mobile.jpeg</code>, with progress, Back, and Next controls. Both covered the same core sequence: company profile, optional evidence, EMITS/AVOIDS activity selection, and free-text description.</p>
          <div className="walkthrough-sequence">
            {onboardingSteps.map(([number, title, detail]) => (
              <span key={number}><i>{number}</i><b>{title}</b><small>{detail}</small></span>
            ))}
          </div>
          <FieldworkFigure
            src="/assets/images/gtr/fieldwork/onboarding-flow-4up.jpg"
            alt="Four hand-drawn screens for Assessment 2"
            caption="Assessment 2 / assessment2-mobile.jpeg: four screens for company profile, optional local documents, EMITS/AVOIDS activity selection, free-text description, and generate assessment."
          />
          <FieldworkFigure
            src="/assets/images/gtr/fieldwork/onboarding-sheets.jpg"
            alt="Five handwritten paper sheets showing the free impact assessment intake flow"
            caption="Assessment 1 / assessment1.jpeg: continuous long-form layout with business model, team size, evidence prompts, activity selection, and generate-assessment CTA."
          />
          <p>Screen 3 collects EMITS (-) footprint and AVOIDS (+) handprint activities. Selection determines estimation scope.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>EMITS (-) footprint</th><th>AVOIDS (+) handprint</th></tr></thead>
              <tbody>
                <tr>
                  <td><ul>{emitsActivities.map((item) => <li key={item}>{item}</li>)}</ul></td>
                  <td><ul>{avoidsActivities.map((item) => <li key={item}>{item}</li>)}</ul></td>
                </tr>
              </tbody>
            </table>
          </div>
          <FieldworkFigure
            src="/assets/images/gtr/fieldwork/funding-stages.jpg"
            alt="Handwritten funding stage list: Pre-Seed, Seed, Series A, Series B plus"
            caption="Investment-stage choices in Assessment 1 (A)."
            label=""
            compact
          />
          <p>Screen 2 states files stay in-browser and are not uploaded to servers.</p>

          <h3>Report 1 (A) / Report 2 (B)</h3>
          <p><b>Report 1</b> (<code>report1-information.jpeg</code>) was information-led: footprint and handprint values, ranked hotspot bars, peer range, cost exposure, methodology, impact beyond carbon, and share/account actions. <b>Report 2</b> (<code>report2-infographic.jpeg</code>) presented the same assessment as visual cards: handprint, maturity gauge, footprint, donut charts for hotspots, and energy/water/waste cards.</p>
          <FieldworkFigure
            src="/assets/images/gtr/fieldwork/assessment-report-print.jpg"
            alt="Printed two-page instant impact assessment report with footprint, handprint, hotspots, peer comparison, and methodology"
            caption="Report 1 / report1-information.jpeg: information-led assessment with footprint, handprint, hotspots, peer comparison, cost exposure, methodology, and share actions."
          />
          <FieldworkFigure
            src="/assets/images/gtr/fieldwork/assessment-report-sketch.jpg"
            alt="Pencil sketch of the instant impact assessment report layout"
            caption="Report 2 / report2-infographic.jpeg: infographic assessment with metric cards, maturity gauge, hotspot charts, and impact-beyond-carbon cards."
          />
          <h3>Dashboard concept</h3>
          <p>Dashboard sketch: footprint, handprint, derived net, maturity gauge, climate goals, milestones, impact projection. Sample values differ from instant report (footprint 42.6, handprint 108, net -65.4 tCO₂e on sketch vs 10.7 / ~20 on report). Participants asked to define impact projection, milestone diagram, net impact, and maturity levels.</p>
          <FieldworkFigure
            src="/assets/images/gtr/fieldwork/dashboard-sketch.jpg"
            alt="Hand-drawn dashboard overview sketch with footprint, handprint, net impact, maturity level, climate goals, milestones, and impact projection"
            caption="dashboard.jpeg: separate footprint and handprint, derived net, maturity, goals, milestones, and impact projection."
          />

        </section>

        <section className="report-chapter" id="fieldwork-findings">
          <span className="report-number">8</span>
          <h2>Aggregated findings</h2>
          <p className="report-lead">Directional cross-participant observations from five sessions. These findings identify what to retest; they do not establish validation.</p>
          <div className="report-table-scroll">
            <table className="report-table report-table-wide">
              <thead><tr><th>Finding</th><th>Observation</th><th>Implication</th></tr></thead>
              <tbody>
                {aggregatedFindings.map(([finding, observation, implication]) => (
                  <tr key={finding}><td>{finding}</td><td>{observation}</td><td>{implication}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>


      </div>
    </section>
  );
}

function Stage1Page() {
  return (
    <section className="report-section" id="stage-1">
      <ChapterLabel number="1.1">First Prototype / Stage 1 PRD</ChapterLabel>
      <div className="report-document">
        <PageIntro
          eyebrow="PRD stage 1"
          title="The MVP is a climate startup impact dashboard"
          summary="Stage 1 defines the first shippable product: a two-sided dashboard for climate startups that tracks positive and negative impact separately, applies integrity gates, and turns the result into weekly action."
          links={[
            ["/gtr/", "Back to the report"],
            ["/gtr/docs/stage-2/", "Read Stage 2"],
          ]}
        />

        <section className="report-chapter">
          <span className="report-number">0</span>
          <h2>Goals</h2>
          <ol>
            {stage1Goals.map((goal) => <li key={goal}>{goal}</li>)}
          </ol>
        </section>

        <section className="report-chapter">
          <span className="report-number">1</span>
          <h2>Users</h2>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Persona</th><th>Need</th></tr></thead>
              <tbody>
                <tr><td>Climate founder</td><td>Defend impact to investors without overclaiming.</td></tr>
                <tr><td>Climate VC / analyst</td><td>Verify the claim in diligence.</td></tr>
                <tr><td>Startup operator</td><td>Know what to do this week.</td></tr>
                <tr><td>LP or advisor</td><td>Read the share page with uncertainty intact.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-chapter">
          <span className="report-number">2</span>
          <h2>Core modules</h2>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Module</th><th>Purpose</th></tr></thead>
              <tbody>
                <tr><td>Impact ledger</td><td>Shows + handprint and - footprint side by side.</td></tr>
                <tr><td>Integrity gates</td><td>Checks baseline, displacement, and additionality.</td></tr>
                <tr><td>Freshness layer</td><td>Labels metered versus modeled values and their cadence.</td></tr>
                <tr><td>Goal board</td><td>Assigns owners, deadlines, and evidence.</td></tr>
                <tr><td>Progress game</td><td>Uses levels and evidence points to create weekly momentum.</td></tr>
                <tr><td>Share page</td><td>Communicates the result to investors and internal reviewers.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-chapter">
          <span className="report-number">3</span>
          <h2>Non-goals</h2>
          <ul>
            <li>Not a certified carbon-accounting product.</li>
            <li>Not a broad tech-startup product yet.</li>
            <li>Not a compliance filing tool.</li>
            <li>Not a handprint-only calculator.</li>
          </ul>
          <aside className="report-note"><b>Stage 1 verdict</b><p>If the climate-startup wedge does not work, the rest of the system should not expand.</p></aside>
        </section>
      </div>
    </section>
  );
}

function Stage2OverviewPage() {
  return (
    <section className="report-section" id="stage-2">
      <ChapterLabel number="2.1">Second Prototype / Stage 2 PRD</ChapterLabel>
      <div className="report-document">
        <PageIntro
          eyebrow="PRD stage 2 — second prototype, built"
          title="Stage 2 ships a working web app"
          summary="Stage 2 turned the Stage 1 PRD into a deployed Cloudflare Workers product. The full breakdown — the cross-cutting goals, what changed from Stage 1, the auth / storage stack, the non-goals, the open questions, and all eleven sub-PRDs (Onboarding A, Onboarding B, Report A, Dashboard A, Report + Dashboard Connected, Insights, The Model, Auth & Access, Foundation-Model Handling, Multi-Sector Reports, Admin & Platform) — is on this single page. Scroll, or use the contents below."
          links={[
            ["/gtr/docs/stage-1/", "Review Stage 1 PRD"],
            ["/gtr/docs/fieldwork-report/", "Fieldwork report"],
            ["/gtr/docs/fieldwork-report/feedback/", "Presentation feedback"],
          ]}
        />

        <nav className="report-contents" aria-label="Stage 2 PRD contents">
          <p>In this PRD</p>
          <a href="#s2-goals"><span>0</span>Goals</a>
          <a href="#s2-changes"><span>1</span>What changed from Stage 1</a>
          <a href="#s2-auth"><span>2</span>Auth &amp; storage</a>
          <a href="#s2-nongoals"><span>3</span>Non-goals</a>
          <a href="#s2-open"><span>4</span>Open questions</a>
          <a href="#s2-onboarding-a"><span>5</span>Onboarding A — in-app 6-step wizard</a>
          <a href="#s2-onboarding-b"><span>10</span>Onboarding B — ChatGPT MCP server</a>
          <a href="#s2-report-a"><span>15</span>Report A — hybrid report</a>
          <a href="#s2-dashboard-a"><span>18</span>Dashboard A — vertical hierarchy</a>
          <a href="#s2-connected"><span>20</span>Report + Dashboard Connected (B)</a>
          <a href="#s2-insights"><span>24</span>Giving Actionable Insights</a>
          <a href="#s2-model"><span>29</span>The Model — the evidence library</a>
          <a href="#s2-auth-access"><span>33</span>Auth, Accounts &amp; Access</a>
          <a href="#s2-foundation"><span>37</span>Foundation-Model Handling</a>
          <a href="#s2-multisector"><span>41</span>Modular Multi-Sector Reports</a>
          <a href="#s2-admin"><span>45</span>Admin &amp; Platform</a>
        </nav>

        <section className="report-chapter" id="s2-goals">
          <span className="report-number">0</span>
          <h2>Goals</h2>
          <p className="report-lead">Cross-cutting. Every sub-PRD inherits these.</p>
          <ol>
            {stage2Goals.map((goal) => <li key={goal}>{goal}</li>)}
          </ol>
        </section>

        <section className="report-chapter" id="s2-changes">
          <span className="report-number">1</span>
          <h2>What changed from Stage 1</h2>
          <ul>
            {stage2Changes.map((change) => <li key={change}>{change}</li>)}
          </ul>
        </section>

        <section className="report-chapter" id="s2-auth">
          <span className="report-number">2</span>
          <h2>Auth &amp; storage</h2>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Layer</th><th>Choice</th><th>Why</th></tr></thead>
              <tbody>
                {stage2Stack.map(([layer, choice, why]) => (
                  <tr key={layer}><td>{layer}</td><td>{choice}</td><td>{why}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>Anonymous previews let logged-out visitors generate a limited preview report. A daily quota is enforced per client IP (<code>anonymous_report_limits</code> in D1) so AI billing stays predictable. The preview uses the same modeled snapshot path the post-login report uses — the difference is only whether the result persists.</p>
        </section>

        <section className="report-chapter" id="s2-nongoals">
          <span className="report-number">3</span>
          <h2>Non-goals</h2>
          <ul>
            <li>Not a certified carbon-accounting product. The first report is a directional model, not an audit-grade submission.</li>
            <li>Not a broad tech-startup product yet. The Stage 1 wedge — climate-tech founders first — is still the gate.</li>
            <li>Not a compliance filing tool. CSRD / SB 253 / SB 261 are referenced as precedents, not as a filing format.</li>
            <li>Not a handprint-only calculator. The +/- separation is preserved in every tile, every dashboard section, and every share card.</li>
            <li>Not a leaderboard or public ranking. Amali's fieldwork request was recorded as future work and intentionally deferred.</li>
          </ul>
        </section>

        <section className="report-chapter" id="s2-open">
          <span className="report-number">4</span>
          <h2>Open questions for the next test round</h2>
          <p className="report-lead">The second prototype is shippable, but it is not yet a validated product. The next round of founder testing needs to answer these.</p>
          <ol>
            {stage2Open.map((q) => <li key={q}>{q}</li>)}
          </ol>
          <aside className="report-note report-note-yellow"><b>Stage 2 verdict</b><p>The Stage 1 PRD's wedge — climate-tech founders first, +/- separation visible, weekly operating loop — has been kept intact while the surface area grew. The next test round decides whether the system is usable enough that the loop actually sticks.</p></aside>
        </section>

        <section className="report-chapter" id="s2-onboarding-a">
          <span className="report-number">5</span>
          <h2>Onboarding A — the 6-step in-app wizard</h2>
          <p>After the fieldwork-week tests, the in-app intake is a 6-step guided wizard with visible progress, dropdowns instead of free text, tailored defaults per business model, and a live preview that earns trust before document upload is asked for. The first visible payoff is the report — Phase A moved account creation and file upload behind the instant result.</p>

          <h3>Funnel — the report is the first payoff</h3>
          <p>Phase A reversed the Stage 1 sequence. Auth and document upload no longer sit in front of the assessment; the report renders from the local state snapshot before any account is created. Log in is now a downstream "save your history" gate, not a precondition to seeing the result.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Step</th><th>What happens</th></tr></thead>
              <tbody>
                {stage2Funnel.map(([step, detail]) => (
                  <tr key={step}><td>{step}</td><td>{detail}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>The methodology page is its own dedicated screen in the funnel. The founder sees the framework before being asked to fill in the form. The "your data stays private" line sits on the landing page; the same promise is restated at the account gate.</p>

          <h3>Tailored intake — the business model gates the form</h3>
          <p>Phase F made the intake respect the founder's actual business. The "business model" field selects a profile that pre-fills defaults, weights activities, and surfaces the right levers. Foundation-model teams — the cohort whose compute footprint the per-FTE baseline visibly mis-measures — are routed through a separate path with a 1000x compute multiplier and an explicit RLHF / data-annotation workforce baseline of 25,000 tCO2e/yr.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Profile</th><th>What it emphasizes</th></tr></thead>
              <tbody>
                {stage2Profiles.map(([profile, detail]) => (
                  <tr key={profile}><td>{profile}</td><td>{detail}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>Phase C converted the remaining free-text fields to dropdowns (cloud provider, hosting region, primary activity, energy source) with an "Other (specify)" escape hatch. The hybrid case aggregates the matched sector benchmarks and combines their notes.</p>

          <h3>Document upload — optional, behind the report</h3>
          <p>Phase B demoted document upload from a required step to an optional, skippable one. The <code>/api/documents</code> endpoints and the R2 binding stay wired for an incubator-only path, but the UI no longer asks. Stealth-mode and one-person teams can complete the assessment without exposing source files.</p>
          <p>The discoverable "upload evidence" path still lives in the dashboard's right rail — Phase B did not remove the option, it just stopped making it the second thing a founder sees. Incubator / investor partners can offer document sharing inside a trusted context instead.</p>

          <h3>Accessibility and copy</h3>
          <p>Quick wins that shipped with the wizard:</p>
          <ul>
            <li>Visible <code>[Required]</code> chip on required fields, with <code>aria-required="true"</code> for screen readers (Q1 a11y).</li>
            <li>Inline glossary tooltips wrap "net impact", "footprint", "handprint", "maturity level" on first use (Q2).</li>
            <li>Landing copy states audience, scope, product type, and a "your data stays private" line up front (Q4).</li>
            <li>Live footprint preview in the wizard — closes the fieldwork finding that founders asked "what do I get from this?"</li>
          </ul>
          <aside className="report-note"><b>Why "A"</b><p>Onboarding A is the visual, self-serve path. It is the right default for most founders. For the cohort that already lives inside an AI client, Onboarding B is the parallel path — same math, different surface.</p></aside>
        </section>

        <section className="report-chapter" id="s2-onboarding-b">
          <span className="report-number">10</span>
          <h2>Onboarding B — the same assessment, run from ChatGPT or Claude</h2>
          <p>A remote MCP server at <code>/mcp</code> exposes the assessment as a set of tools to AI clients — ChatGPT, Claude Desktop, Cursor, and any other MCP-compatible client. The founder completes the intake conversationally, in the tool they already work in. Data stays in the AI client; pushing the result to the dashboard is opt-in via a separate one-time link.</p>

          <h3>What MCP gives the assessment</h3>
          <p>The MCP server (<code>worker/mcp.js</code>) is a stateless Streamable HTTP endpoint at <code>/mcp</code>. It does not require a Durable Object, a session cookie, or any per-call state. Each tool call is self-contained: a list call returns the same JSON every time, and <code>compute_snapshot</code> is a pure function of the inputs. That makes it cheap to host and safe to expose.</p>
          <p>The server is built on the raw MCP SDK (not the Agents SDK) so it runs on Workers, Node 18+, Deno, and Bun without runtime-specific imports. Founders connect their AI client to <code>https://&lt;worker&gt;/mcp</code> once; the client handles the protocol.</p>

          <h3>Tools exposed</h3>
          <div className="report-table-scroll">
            <table className="report-table report-table-wide">
              <thead><tr><th>Tool</th><th>What the AI uses it for</th></tr></thead>
              <tbody>
                {stage2McpTools.map(([tool, what]) => (
                  <tr key={tool}><td><code>{tool}</code></td><td>{what}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>All read-only tools (<code>list_*</code>) are unrestricted. <code>compute_snapshot</code>, <code>generate_report</code>, and <code>create_dashboard_save_link</code> are gated — the AI is told to call them only when the founder has confirmed the inputs.</p>

          <h3>The flow</h3>
          <ol>
            <li>Founder connects ChatGPT (or Claude / Cursor) to the MCP endpoint.</li>
            <li>The AI calls <code>list_business_models</code>, <code>list_funding_stages</code>, and <code>list_activities</code> to learn the schema.</li>
            <li>The AI walks the founder through the inputs conversationally, using <code>list_glossary_terms</code> for any jargon the founder asks about.</li>
            <li>When the founder is happy, the AI calls <code>compute_snapshot</code> to confirm the modeled numbers, then <code>generate_report</code> for the full AI briefing.</li>
            <li>Pushing to the dashboard is a separate, explicit step: <code>create_dashboard_save_link</code> returns a one-time link the founder clicks to copy the assessment into the dashboard.</li>
          </ol>
          <p>The result is a JSON payload the AI narrates inline. The founder never has to visit the standalone site to get a report — that is the point.</p>

          <h3>Privacy — data stays in the client</h3>
          <p>The MCP server is stateless and does not persist assessment data. The <code>create_dashboard_save_link</code> tool returns a short-TTL link (default 600 seconds) the founder uses to push the assessment to their dashboard; until they click it, the assessment lives in the AI client's conversation history. The server itself forgets the call as soon as it returns.</p>
          <p>There is no anonymous-quota path for the MCP route: the AI client has its own usage model, and the assessment is generated against the founder's existing account on the underlying LLM. The Worker only bills the AI for the briefing call.</p>
          <aside className="report-note report-note-yellow"><b>MVP gap</b><p>The dashboard does not auto-receive MCP assessments yet. The <code>create_dashboard_save_link</code> tool currently returns the assessment JSON inside the link payload; the founder pastes it into the dashboard. The auto-receive path is the next step.</p></aside>

          <h3>Compared to Onboarding A</h3>
          <div className="report-table-scroll">
            <table className="report-table report-table-wide">
              <thead><tr><th>Dimension</th><th>Onboarding A</th><th>Onboarding B</th></tr></thead>
              <tbody>
                {stage2OnboardingCompare.map(([dim, a, b]) => (
                  <tr key={dim}><td>{dim}</td><td>{a}</td><td>{b}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-chapter" id="s2-report-a">
          <span className="report-number">15</span>
          <h2>Report A — the report earns trust with a snapshot and rewards it with evidence</h2>
          <p>Phase E combined Report 1's explanatory depth with Report 2's infographic clarity. The default view is a one-page snapshot; "Show methodology" and "Show evidence" expanders reveal the factor sources, framework definitions, and citations behind every tile. The AI briefing is grounded in the same evidence library the snapshot draws from, so the narrative can never disagree with the numbers.</p>

          <h3>The model — every number is sourced</h3>
          <p>The product's honesty rules are encoded in <code>data/evidence.js</code>, a single source of truth imported by both the SPA and the Worker. Every default factor names a public source + URL + year; benchmarks are derived ranges (per-FTE × typical headcount) and say so; regulatory precedents carry a status / date because regulation moves; and the AI is constrained to cite only from this library — never to invent a citation, statistic, or URL.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Library</th><th>What it provides</th></tr></thead>
              <tbody>
                {stage2Evidence.map(([name, what]) => (
                  <tr key={name}><td><code>{name}</code></td><td>{what}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="report-note"><b>Honesty rule</b><p>Defaults are labelled modeled, never measured. The dashboard invites founders to replace them with their own data — kWh from a utility bill, supplier invoices, token spend — and visibly narrows the uncertainty band when they do.</p></aside>

          <h3>Tiles — the one-page snapshot</h3>
          <p>Phase E combined Report 1's explanatory depth with Report 2's infographic clarity. The default view is a one-page snapshot; "Show methodology" and "Show evidence" expanders reveal the factor sources, framework definitions, and citations behind every tile.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Tile</th><th>Source</th></tr></thead>
              <tbody>
                {stage2ReportTiles.map(([tile, source]) => (
                  <tr key={tile}><td>{tile}</td><td>{source}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>AI briefing — grounded, cited, reversible</h3>
          <p>The AI briefing sits inside the report. It pulls company-specific environmental issues and analogous peer incidents through Google Search grounding when the founder supplies a public website, then constrains the model to cite only the curated fact pack assembled by <code>buildFactPack()</code>. Search queries and web sources are surfaced inline; the briefing never invents a URL.</p>
          <p>If the briefing's confidence is low, the system says so. The default call returns a 503 with a clear message when the Gemini key is absent, and the modeled snapshot still renders — the founder never sees a half-loaded report.</p>
          <aside className="report-note report-note-yellow"><b>SSRF guard</b><p>The Worker fetches the submitted public website behind SSRF guards (blocked private / local hosts, size-capped reads, timeout). The fetched content is included in the prompt, but the model is told to use it as background context only — citations still come from the fact pack.</p></aside>
        </section>

        <section className="report-chapter" id="s2-dashboard-a">
          <span className="report-number">18</span>
          <h2>Dashboard A — the dashboard earns a second visit by surfacing the live number</h2>
          <p>Phase D reordered the dashboard so the things founders actually return to — goals, milestones, and the live footprint / handprint snapshot — sit at the top. The four-card row that testers skipped was split: footprint and handprint stay prominent; net and cost moved to a "Details" expander. The dashboard is no longer a project plan; it is the second visit's reason to exist.</p>

          <h3>Why vertical</h3>
          <p>The fieldwork report flagged two things at once: the four-card horizontal row got skipped, and the goals / milestones section was confused with the maturity section. Phase D fixes both with a single move — reorder top-to-bottom so the things the founder came back for sit at the top, and the things that earn trust on second read sit below them in expandable sections.</p>
          <p>The dashboard is no longer a one-glance readout; it is a sequence: glance (live number), orient (risks, maturity), act (goals, recommendations), look back (history).</p>

          <h3>Sections, top to bottom</h3>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Section</th><th>Purpose</th></tr></thead>
              <tbody>
                {stage2Dashboard.map(([section, purpose]) => (
                  <tr key={section}><td>{section}</td><td>{purpose}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>Actionable items (goals, recommendations, AI briefing) live in the Insights section below. The longitudinal surface (report history, snapshot comparison) lives in the Report + Dashboard Connected section. This page is the live snapshot — the things that need to be visible every visit.</p>
        </section>

        <section className="report-chapter" id="s2-connected">
          <span className="report-number">20</span>
          <h2>Report + Dashboard Connected (B) — snapshots, not settings</h2>
          <p>Phase G + report history make the dashboard a longitudinal surface. Every assessment is a snapshot the founder can save, list, open, and delete. Each snapshot carries its own visibility (private / link / investor) and its own share card. The report stops being a one-off deliverable and starts being the database the dashboard reads from.</p>

          <h3>Report history — the four actions</h3>
          <p>Every completed assessment can be saved as a snapshot. The snapshot is the full workspace state — not a stripped-down report. Opening a snapshot replaces the current workspace, putting the founder back into a specific moment. Deleting a snapshot removes only that moment; the current state is unaffected.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Action</th><th>Endpoint</th></tr></thead>
              <tbody>
                {stage2ReportHistoryActions.map(([action, detail]) => (
                  <tr key={action}><td>{action}</td><td dangerouslySetInnerHTML={{ __html: detail }} /></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>The history list shows snapshots newest-first, with a one-line summary of each (footprint, handprint, net, date, visibility). Opening a snapshot is a deliberate "I want to see this version" action — the dashboard does not auto-switch between them.</p>

          <h3>Per-snapshot visibility</h3>
          <p>Phase G built on the Stage 1 quick win (Q3) and turned sharing into a per-report decision. Each saved snapshot carries one of three visibility states:</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Visibility</th><th>Who can see it</th></tr></thead>
              <tbody>
                {stage2ShareVisibility.map(([v, detail]) => (
                  <tr key={v}><td>{v}</td><td dangerouslySetInnerHTML={{ __html: detail }} /></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>The visibility is set on the snapshot, not on the account. A founder can keep last month's private and share this month's investor link from the same dashboard.</p>

          <h3>Share card — the OG image</h3>
          <p>The share-card generator auto-renders an Open Graph image with the founder's climate-impact grade and the benchmark bands — never the raw numbers. The link underneath the card is bound to the snapshot's visibility, so a private snapshot produces a private link, a link-only snapshot produces a link, and an investor snapshot produces a time-limited token URL.</p>
          <p>The LinkedIn share path has been demoted behind a consent dialog that defaults to a private link, addressing the fieldwork-week finding that founders refused to share high-emission results publicly. Sharing high-emission results still works — the founder just has to do it deliberately.</p>
          <aside className="report-note report-note-yellow"><b>Privacy default</b><p>Public sharing requires an explicit visibility choice. LinkedIn and share-card buttons stay disabled until the founder opts in — the system makes opting out the path of least resistance.</p></aside>

          <h3>Why this is "B" not "A"</h3>
          <p>Report A and Dashboard A are the standalone surfaces. Report + Dashboard Connected is what happens when the two stop being separate products. The history layer is what makes the weekly operating loop real: "what did we measure last month?", "is the handprint claim still defensible?", "did the cost-exposure estimate move?" all become answerable from the same snapshot stream.</p>
          <p>The Stage 1 PRD's "weekly operating loop" only works if the loop closes — and the loop closes when a snapshot taken on day 1 can be compared against a snapshot taken on day 30. That is what this page is for.</p>
        </section>

        <section className="report-chapter" id="s2-insights">
          <span className="report-number">24</span>
          <h2>Giving Actionable Insights — making the next decision obvious</h2>
          <p>A snapshot is not a product. A report is not a product. The product is what the founder does after the report — the goals, the recommendations, the maturity progression, the follow-up cadence. This section documents the surfaces that turn measurement into action, and the conditions under which those insights stay trustworthy as the product grows.</p>

          <h3>Goals rail — owned actions, deadlines, evidence</h3>
          <p>The goals rail groups near the top of the dashboard per the fieldwork-density finding. Each goal has an owner, a deadline, and an evidence point. The progress game uses levels and evidence points to create weekly momentum, not vanity points — a goal only counts toward maturity if the evidence is attached.</p>
          <p>Goals are not auto-generated. The recommendations system proposes them; the founder accepts, rejects, or rewrites. The acceptance is the act that ties the goal to a maturity progression.</p>

          <h3>Recommendations — where they come from</h3>
          <p>Recommendations are rendered from the snapshot. Five signal sources feed them:</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Source</th><th>What it contributes</th></tr></thead>
              <tbody>
                {stage2InsightSources.map(([src, what]) => (
                  <tr key={src}><td>{src}</td><td>{what}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>A recommendation is shown with its source signal explicitly labelled. "Reduce cloud spend" cites the snapshot's footprint rank; "Engage your largest customer on the handprint claim" cites the precedent library. The founder can trace every recommendation back to the data that produced it.</p>

          <h3>Maturity progression</h3>
          <p>Maturity is a four-level progression that mirrors the share-page's audit label. The dashboard shows the current level, the inputs that would move it up, and the date the level last changed.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Level</th><th>What it means</th></tr></thead>
              <tbody>
                {stage2MaturityStages.map(([stage, what]) => (
                  <tr key={stage}><td>{stage}</td><td>{what}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>The maturity level is also a share-page label. A Level 3 dashboard can carry a "measured" badge on the public share; a Level 4 can carry an "audited" badge. The badge is a derivation, not a separate input — it stays consistent with the dashboard.</p>

          <h3>AI briefing as insight</h3>
          <p>The AI briefing is reused on the dashboard, not regenerated. The same grounded narrative the founder saw in the report travels with the snapshot, so the dashboard's "what does this mean?" answer is consistent with the report's. The briefing never invents a URL — it cites only from the fact pack.</p>
          <p>The briefing is persistent on the dashboard. It is not a one-time reveal; it is a surface the founder can re-read. If the underlying snapshot changes (a goal is closed, a milestone is hit), the briefing re-grounds against the new facts.</p>

          <h3>Follow-up cadence</h3>
          <p>Every metric has a natural cadence. The dashboard surfaces it: a cloud-spend line is a monthly metric; a travel line is a quarterly one; a handprint claim is an annual one. Recommendations arrive at the cadence their underlying metric deserves, not on a single notification schedule.</p>
          <p>Cadence drift is the default failure mode — the same recommendation pinging weekly until the founder ignores it. The fix is to bind the cadence to the metric, not to the user, and to suppress repeat recommendations until the underlying signal changes.</p>
          <aside className="report-note report-note-yellow"><b>Why insights are last</b><p>Insights are the place where the other surfaces connect. Onboarding A and B produce the snapshot. Report A shows the snapshot. Dashboard A is the live view. Report + Dashboard Connected is the longitudinal view. Insights is what the founder does next, fed by all four.</p></aside>
        </section>

        <section className="report-chapter" id="s2-model">
          <span className="report-number">29</span>
          <h2>The Model — every number traces back to a named source</h2>
          <p><code>data/evidence.js</code> is the single source of truth for every emission factor, framework, benchmark, precedent, and AI-grounded fact. It is imported by both the SPA and the Worker so the numbers the founder sees and the numbers the AI cites are the same numbers. The honesty rules in this file are not a coding convention — they are the product.</p>

          <h3>What the library contains</h3>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Name</th><th>What it provides</th></tr></thead>
              <tbody>
                {stage2EvidenceLibrary.map(([name, what]) => (
                  <tr key={name}><td><code>{name}</code></td><td>{what}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="report-note"><b>Single source of truth</b><p>The SPA and the Worker both import from <code>data/evidence.js</code>. The founder-facing snapshot in the browser and the AI-grounded report from the Worker resolve the same emission factors, the same benchmark ranges, and the same precedent URLs. A change in <code>data/evidence.js</code> lands in both surfaces on the next deploy.</p></aside>

          <h3>The honesty rules</h3>
          <p>The library is governed by a small set of rules. They are not aspirational — every entry in the file follows them, and the dashboards visibly surface any default that violates them.</p>
          <ul>
            {stage2HonestyRules.map((rule) => <li key={rule[0]} dangerouslySetInnerHTML={{ __html: `<b>${rule[0]}.</b> ${rule[1]}` }} />)}
          </ul>

          <h3>How a fact reaches the AI</h3>
          <p>The path from a founder input to a cited AI claim is five steps. Every step is auditable in the Worker logs.</p>
          <ol>
            {stage2EvidenceFlow.map(([step, detail]) => (
              <li key={step}><b>{step}:</b> <span dangerouslySetInnerHTML={{ __html: detail }} /></li>
            ))}
          </ol>
          <p>The fact pack is the boundary the AI cannot cross. A founder who asks the briefing a question outside the fact pack gets a calibrated "I don't have evidence for that" rather than a confident invention.</p>

          <h3>What lives where</h3>
          <p>The library is split between <code>data/evidence.js</code> (the curated content) and <code>worker/snapshot.js</code> (the math that consumes it). The split is deliberate: the content changes when a methodology is updated; the math changes when the team size scaling rule or the foundation-model multiplier changes. Keeping them in separate files makes both reviewable.</p>
          <p>The activities database (<code>ACTIVITIES_DB</code>) lives in <code>worker/snapshot.js</code> because it is consumed by <code>computeSnapshot()</code>. Its <code>type: "modeled"</code> flag is what makes the honesty rule "modeled, never measured" enforceable: a measured input from the founder overrides the <code>defaultVal</code> in the dashboard, and the snapshot records the override.</p>
        </section>

        <section className="report-chapter" id="s2-auth-access">
          <span className="report-number">33</span>
          <h2>Auth, Accounts &amp; Access — the account gate sits after the report, not before it</h2>
          <p>PBKDF2 password hashing, HttpOnly / Secure / SameSite=Lax session cookies, and a D1-backed account schema run the signed-in product. Anonymous previews, the <code>?invite=</code> deep link, and the per-IP daily quota run the path that does not require an account. The two surfaces are deliberately independent — the same snapshot can be generated without an account and saved with one.</p>

          <h3>Auth surface</h3>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Action</th><th>Endpoint</th></tr></thead>
              <tbody>
                {stage2AuthSurface.map(([action, detail]) => (
                  <tr key={action}><td>{action}</td><td dangerouslySetInnerHTML={{ __html: detail }} /></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>PBKDF2 runs in the browser via the WebCrypto API at 100,000 iterations, over a per-user salt. The server stores only the hash and the salt; the password is never logged or persisted. The session cookie is the row id of a D1 row in <code>sessions</code>, looked up server-side on every authenticated request.</p>

          <h3>The invite flow</h3>
          <p>Invite links grant the free assessment, never a direct drop into someone else's dashboard. The SPA detects <code>?invite=&lt;token&gt;</code> in <code>window.location.search</code> and forces the funnel to the onboarding step, regardless of whether the visitor is already signed in.</p>
          <ol>
            {stage2InviteFlow.map(([step, detail]) => (
              <li key={step}><b>{step}:</b> <span dangerouslySetInnerHTML={{ __html: detail }} /></li>
            ))}
          </ol>
          <p>The invite path uses the same anonymous-quota path as a non-invited visitor. The invitation does not raise the per-IP daily cap. The invite does not auto-create an account — the founder decides whether to sign up after seeing the report.</p>

          <h3>D1 schema</h3>
          <p>All persistence lives in a single D1 (SQLite) database. The schema is small and explicit — the Worker creates the tables on first read if they are missing.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Table</th><th>Shape</th></tr></thead>
              <tbody>
                {stage2AuthStorage.map(([table, shape]) => (
                  <tr key={table}><td><code>{table}</code></td><td>{shape}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Anonymous previews</h3>
          <p>Logged-out visitors can generate a limited preview report. A daily quota is enforced per client IP in the <code>anonymous_report_limits</code> table — subject_hash is SHA-256(day + client IP), so the limit resets at UTC midnight and does not persist across days.</p>
          <p>The preview uses the same modeled snapshot path the post-login report uses. The difference is only whether the result persists: anonymous previews return the JSON in the response, signed-in users get the same JSON stored as a row in <code>report_history</code> via the save endpoint.</p>
          <aside className="report-note report-note-yellow"><b>Quota and AI cost</b><p>The anonymous preview path is the only place the AI runs without a logged-in account. The quota exists to keep Gemini spend predictable. If the limit is hit, the Worker returns a clear 429 with the reset time — the snapshot still renders, the AI briefing is just not generated.</p></aside>
        </section>

        <section className="report-chapter" id="s2-foundation">
          <span className="report-number">37</span>
          <h2>Foundation-Model Handling — a special case that earns its own page</h2>
          <p>Foundation-model and heavy-compute teams are the cohort where the per-FTE carbon baseline visibly fails. A team of 10 with 8.5 tCO2e/yr of modeled compute is not a SaaS startup — it is a frontier-model lab whose real footprint includes training runs, inference farms, and a distributed RLHF / data-annotation workforce. Stage 2 routes these teams through a separate math path with a 1000x compute multiplier and a 25,000 tCO2e/yr workforce baseline.</p>

          <h3>The profile</h3>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Dimension</th><th>What it does</th></tr></thead>
              <tbody>
                {stage2FoundationModelProfile.map(([dim, what]) => (
                  <tr key={dim}><td>{dim}</td><td>{what}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>The flag is <code>isFoundationModel</code> on the assessment. It is set when the founder selects "Foundation Model / Heavy Compute" in the business-model step, or when the system auto-detects heavy-compute signals from the input (large cloud spend, training-job cadence in the notes).</p>

          <h3>Why the SaaS baseline fails here</h3>
          <p>The SaaS benchmark band in <code>BENCHMARKS.sectors.SaaS</code> is 1.5–4.0 tCO2e/FTE/yr. A frontier-model team with 10 staff, 8 GPUs running 24/3, 3 large training jobs per quarter, and a 200-person RLHF contractor network sits at 5,000–20,000 tCO2e/yr — three orders of magnitude above the SaaS band. Without the special case, the per-FTE baseline would underreport by ~1000x, and the founder would receive a share page that says "you're at the bottom of your peer band" when the actual footprint is large and well-known.</p>
          <p>The fix is not a better default. The fix is a separate path that admits the workload is different.</p>

          <h3>What the 25,000 tCO2e/yr workforce baseline covers</h3>
          <p>RLHF and data-annotation workforces are typically distributed (vendors across multiple countries), often working from home or shared offices. The carbon footprint of this labor is not a per-FTE employee commuting number — it is a category-1 purchased-services line for the contractor vendor plus a smaller share of the contractor's own office energy. The 25,000 tCO2e/yr figure is a flat baseline, not a per-FTE number, and is injected as a separate footprint line on the snapshot so the founder sees it and can replace it with their own measured value.</p>
          <p>The 25,000 figure is conservative for large US/EU RLHF operations and on the low end for offshore-heavy workforces. It is the same order of magnitude cited in public RLHF footprint analyses; the dashboard labels it as an indicative default and invites replacement.</p>

          <h3>What it does not change</h3>
          <p>The +/- separation stays. A foundation-model founder still has to defend the handprint side with baseline, displacement, and additionality gates — the 1000x multiplier is a footprint number, not a handprint number. The integrity gates on the avoided side (avoided-grid, avoided-transport, avoided-material) are unchanged.</p>
          <p>If the founder can supply measured token spend (kWh from a hyperscaler bill, training-job GPU-hours, RLHF-vendor invoices), the snapshot uses the measured value and the 1000x multiplier falls away. The model defaults are a fallback, not a ceiling.</p>
          <aside className="report-note report-note-yellow"><b>Honest uncertainty</b><p>The foundation-model snapshot has wider uncertainty bands than a SaaS snapshot, because the input space is larger and the supplier footprint depends on data-center region, cooling, and PUE. The report labels the +/- band explicitly so the founder (and any diligence reader) sees the margin.</p></aside>
        </section>

        <section className="report-chapter" id="s2-multisector">
          <span className="report-number">41</span>
          <h2>Modular Multi-Sector Reports — the benchmark band changes when the business model changes</h2>
          <p>The report's peer benchmark is not a single number — it is selected from a library of sector-specific bands, then aggregated when the founder's operations cross sectors. SaaS, hardware, food, pet services, biotech, foundation model, and hybrid all have distinct defaults. The selection happens in <code>computeBenchmark()</code> from the business-model free-text; the result is shown on the report tile, the share card, and the AI briefing.</p>

          <h3>Sector profiles</h3>
          <p>Each sector has its own <code>BENCHMARKS.sectors</code> entry with low / high tCO2e/FTE/yr, a sourcing note, and a URL. The default units and methodology are consistent across sectors so the founder can read across.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Sector</th><th>Range</th><th>What it captures</th></tr></thead>
              <tbody>
                {stage2MultiSectorProfiles.map(([sector, detail]) => (
                  <tr key={sector}><td>{sector}</td><td>{detail}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Match rules</h3>
          <p>The business-model free-text is scanned for keywords. Each match pushes a sector entry into <code>matchedSectors[]</code>; the empty case falls back to the generic per-FTE range.</p>
          <ol>
            {stage2HybridRules.map(([rule, detail]) => (
              <li key={rule}><b>{rule}:</b> {detail}</li>
            ))}
          </ol>
          <p>The keyword match is deliberately loose — a founder who types "B2B SaaS for utility-scale solar O&amp;M" matches SaaS, hardware, and biotech-ish (lab) signals. The aggregation rule (max-rate, combined notes) is what makes the loose match defensible: the founder sees the upper bound of their cohort, not a lowball.</p>

          <h3>Where the benchmark shows up</h3>
          <p>The selected benchmark is rendered on three surfaces, and all three are kept in sync:</p>
          <ul>
            <li><b>Report tile.</b> A labelled band (low–high) on the peer-benchmark card, with the sector name and the source URL underneath. The founder can click through to the source.</li>
            <li><b>AI briefing.</b> The narrative compares the founder's snapshot to the band and explains whether the founder is inside, below, or above. The narrative cites the band by name and the source URL.</li>
            <li><b>Share card.</b> The OG image shows the founder's grade and the band — never the raw numbers. The sector is in the alt text for accessibility.</li>
          </ul>
          <p>If the founder changes the business model in the dashboard, the report is recomputed and the three surfaces update on the next save. The benchmark is a derivation, not a stored field.</p>

          <h3>Why the report is modular, not monolithic</h3>
          <p>A single "average startup" benchmark hides the cohort the founder cares about. The modular architecture — the sector library, the match rules, the aggregation rule — exists so the founder reads a benchmark against their actual peers, not against a category that does not describe them.</p>
          <p>The same modularity is what makes Phase F (the tailored intake) defensible. Tailoring the intake changes the snapshot; the modular report reads the snapshot against the matching sector. Two coupled systems, both keyed off the business model.</p>
          <aside className="report-note"><b>Future sectors</b><p>Adding a new sector is a single row in <code>BENCHMARKS.sectors</code> plus a keyword in the match rules. The benchmark rendering, the briefing narrative, and the share card pick it up automatically. The cost of a new sector is the cost of a good source URL — not a code change.</p></aside>
        </section>

        <section className="report-chapter" id="s2-admin">
          <span className="report-number">45</span>
          <h2>Admin &amp; Platform — the operator surface</h2>
          <p>The platform ships two admin endpoints for operator visibility: aggregate stats (user, workspace, document, report, token counts) and the recent AI token logs. Both are gated by an email-based admin check on the Worker. The SPA renders them as a read-only console. There is no user impersonation, no report editing, no destructive action from the admin view — that is by design.</p>

          <h3>Admin endpoints</h3>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Endpoint</th><th>Returns</th></tr></thead>
              <tbody>
                {stage2AdminEndpoints.map(([ep, what]) => (
                  <tr key={ep}><td><code>{ep}</code></td><td>{what}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>Both endpoints are implemented in <code>worker/index.js</code> (<code>getAdminStats</code>, <code>getAdminTokenLogs</code>) and routed through the same session check as the user-facing endpoints. The auth flow is described below.</p>

          <h3>Auth</h3>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Layer</th><th>Rule</th></tr></thead>
              <tbody>
                {stage2AdminAuth.map(([layer, rule]) => (
                  <tr key={layer}><td>{layer}</td><td dangerouslySetInnerHTML={{ __html: rule }} /></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>The email-based check is intentionally simple. It is not a role system; it does not have revoke, transfer, or audit hooks; it does not have a "make this user admin" UI. The check exists to gate two read-only endpoints, and the surface stays small on purpose.</p>

          <h3>What the metrics tell you</h3>
          <p>The admin view surfaces five signals. Each maps to a question the operator needs to answer weekly.</p>
          <div className="report-table-scroll">
            <table className="report-table">
              <thead><tr><th>Metric</th><th>Question it answers</th></tr></thead>
              <tbody>
                {stage2AdminMetrics.map(([metric, question]) => (
                  <tr key={metric}><td><code>{metric}</code></td><td>{question}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>The token logs are the operator's view of AI spend. A spike in a single user's tokens is the early-warning signal for either a successful founder doing many report generations or a runaway / leaked API key. The endpoint returns the most recent 100 rows joined to <code>users</code> so the operator can see who is driving cost.</p>

          <h3>What is deliberately out of scope</h3>
          <p>The admin view does not:</p>
          <ul>
            <li>Impersonate users. An admin never sees a founder's data through the founder's account. The admin endpoints return aggregate metrics; the per-user data is on the founder's own session.</li>
            <li>Edit reports or snapshots. A bad snapshot is deleted by the founder, not by the admin. There is no admin-side edit because the integrity gates that protect the founder would have to be relaxed for an admin to make changes.</li>
            <li>Generate share tokens. Per-snapshot visibility is set by the founder. The admin cannot generate a private link to a private report — the share-token path is session-bound to the founder's account.</li>
            <li>Rotate or revoke sessions. The session table grows; an admin can read its size but not its rows. Revocation is the founder's action (log out).</li>
          </ul>
          <aside className="report-note report-note-yellow"><b>Why observe-only</b><p>The admin view exists to answer "is the platform healthy?" and "who is driving AI cost?" — not to let operators act on the data. Destructive actions stay in the Worker out of band, behind a deploy boundary. The asymmetry is intentional: every operator action is auditable because every operator action requires a deploy.</p></aside>
        </section>
      </div>
    </section>
  );
}

function isDocsIndex(path) {
  return path === "/gtr/docs" || path === "/gtr/docs/" || path.endsWith("/gtr/docs/index.html");
}

function isLegacySlidesPath(path) {
  return path.includes("/gtr/slides/");
}

function isLegacyResearchReportPath(path) {
  return path.includes("/docs/research-report");
}

function App() {
  const path = window.location.pathname;

  useEffect(() => {
    if (isDocsIndex(path)) {
      window.location.replace("/gtr/docs/fieldwork-report/");
    } else if (isLegacySlidesPath(path)) {
      window.location.replace("/gtr/docs/fieldwork-report/slides/");
    } else if (isLegacyResearchReportPath(path)) {
      const hash = window.location.hash || "";
      window.location.replace(`/gtr/${hash}`);
    }
  }, [path]);

  let activeChapter = "intro";
  if (path.includes("/docs/stage-2")) {
    activeChapter = "second-prototype";
  } else if (path.includes("/docs/stage-1") || path.includes("/docs/fieldwork-report")) {
    activeChapter = "first-prototype";
  }

  let docsPage = null;
  if (path.includes("/docs/fieldwork-report/slides")) {
    docsPage = fieldworkSlide.id;
  } else if (path.includes("/docs/fieldwork-report/feedback")) {
    docsPage = fieldworkFeedback.id;
  } else if (path.includes("/docs/fieldwork-report")) {
    docsPage = "fieldwork-report";
  } else if (path.includes("/docs/stage-1")) {
    docsPage = "stage-1";
  } else if (path.includes("/docs/stage-2")) {
    docsPage = "stage-2";
  }

  return (
    <div id="top">
      <Progress />
      <GTRHeader />
      <GTRSidebar
        active={activeChapter}
        subActive={docsPage}
      />

      <main>
        {activeChapter === "intro" && <IntroPage />}
        {activeChapter === "first-prototype" && docsPage === "fieldwork-report" && <FieldworkReportPage />}
        {activeChapter === "first-prototype" && docsPage === "stage-1" && <Stage1Page />}
        {activeChapter === "first-prototype" && docsPage === fieldworkSlide.id && <FieldworkSlidePage />}
        {activeChapter === "first-prototype" && docsPage === fieldworkFeedback.id && <FieldworkFeedbackPage />}
        {activeChapter === "second-prototype" && docsPage === "stage-2" && <Stage2OverviewPage />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
