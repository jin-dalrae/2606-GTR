# Innovation Plan — From 5-Session User Feedback

> **Source:** Aggregated findings + follow-up clarifications from five founder test sessions.
> **Status:** Active roadmap. Quick wins (Q1–Q4) ship in this iteration. The rest is sequenced.

---

## Shipped since plan revision

> **Not in the original 5-session feedback set** — these shipped from direct founder-product conversations and architecture decisions that came out of using the system.

- **Maturity-conditional insights (L0–L5)** — *commit `85d8cb5`*
  - New `data/insights.js` table (Unmapped → Improved) selects a deterministic headline + first action + evidence citations keyed to the user's current maturity level. The dashboard's *"Where You Are"* widget renders this directly; the Gemini report prompt receives the same context and is constrained to align its `firstAction` with it (no LLM drift on the level's required direction). Adds the **hybrid insight model**: deterministic layer for direction, AI layer for elaboration.

---

The feedback surfaced 15 distinct observations. They cluster into four themes, and most of them are **structural** — the underlying flow (assessment → report → dashboard) needs reordering, not just restyling. Quick wins touch the small, low-risk items first so we can re-test the big ones on a tighter, more honest base.

---

## What the feedback is really telling us

| Theme | Root issue | Long-term fix |
|---|---|---|
| **The funnel hides its payoff** | Document upload is currently the first concrete action after landing. Users ask "why am I doing this?" and stop. | Reorder: value-prop → guided intake → **instant report first**, dashboard later. |
| **The intake is one long ambiguous form** | Free-text + ad-hoc structure + no progress signal. | Step-by-step (Assessment 2) + visible step count + dropdowns (Assessment 1's strengths). |
| **The terminology is jargon the founders didn't recognize** | "Net impact", "maturity levels 1–5", "footprint vs handprint" all needed facilitator explanation. | Inline definitions, tooltips, plain-language labels. |
| **The dashboard is too dense and goal-ambiguous** | Four-card row got skipped; goals + milestones got confused. | Vertical hierarchy; group goals & milestones at the top; separate maturity from metrics. |
| **Trust + privacy concerns** | Stealth-mode founders refused to upload; one founder wouldn't share high-emission results publicly. | Default to private; explicit consent before any public share; remove mandatory uploads. |
| **Audience is undefined on the landing page** | "Is this an app? For climate? For finance? For me?" | Explicit audience, scope, and product type on the landing hero. |
| **SaaS/AI founders feel mis-modeled** | Cloud/AI tokens are their main cost; standard hardware defaults look laughable. | Token/compute observability; reduce hardware defaults for SaaS. |

The big rewrite (theme 1+2+4+5) is one coordinated job. It must be done as a single funnel redesign, not as five small edits, or the inconsistency will show in the next round of tests.

---

## Quick wins shipping now (this commit)

These are small, low-risk, and isolate parts of the feedback that don't depend on the funnel rewrite. They also de-risk the rewrite: once these are in, the rewrite can be tested against a more honest baseline.

### Q1 — Accessibility: visible `[Required]` text instead of asterisks  *(feedback: a11y)*
**Effort:** 30 min — `index.html` markup + `index.css` style.
**Change:** Replace `<span class="required">*</span>` with a visually-distinct `[Required]` chip. Add `aria-required="true"` for screen readers. (Already implicit from `required` attribute, but explicit is better.)
**Why now:** Brian explicitly flagged asterisk-only marking. Trivially fixable, immediate a11y win, no UX risk.

### Q2 — Inline tooltips for jargon at first use  *(feedback: net impact / maturity unexplained)*
**Effort:** 1 hr — `index.html` wrapping + reuse existing `.glossary-term` + glossary modal handler.
**Change:** Wrap "net impact", "footprint", "handprint", "maturity level" on the report and dashboard with `<span class="glossary-term" data-term="net-impact">…</span>` (etc.). Confirm the glossary modal already lists these terms; if not, add them. The click-to-open glossary is already wired (`app.js:1687–1697`).
**Why now:** Removes the need for facilitator explanation on the two concepts the testers couldn't define.

### Q3 — Default sharing to private, explicit consent for public share  *(feedback: LinkedIn sharing conditional + privacy)*
**Effort:** 1 hr — `app.js` consent gate + `index.html` copy on the share button.
**Change:**
- `shareToLinkedIn()` (app.js:1016) currently shares whatever is in `state.assessment.snapshot` — including high-emission results — with no consent. Replace with a confirm dialog: *"This snapshot is public. Share a positive summary (footprint + 1 highlight) or copy a private link instead?"* Default option: **private link**.
- Add a small `private by default` note next to the LinkedIn share button.
- Update `copyShareLink()` to be the default CTA, demote LinkedIn to a secondary button.
**Why now:** Privacy concern was the strongest emotional response in the tests. Cheaper to fix than to lose a founder's trust in the field.

### Q4 — Sharpen landing copy: audience, scope, product type  *(feedback: audience scope unclear + value prop missing)*
**Effort:** 1 hr — `index.html` hero copy only.
**Change:**
- Hero eyebrow: replace "Trusted by VC-backed climate founders" with explicit scope: *"For Seed–Series B climate-tech founders. No consultants. No spreadsheets."*
- Hero sub: add a one-liner stating *what* this is: *"A self-serve climate impact assessment for early-stage climate startups — models your footprint, your avoided emissions, and your maturity, in one report you own."*
- Landing-step #1: change "Upload & answer" → "Answer 6 questions" (de-emphasizes upload; consistent with future funnel rewrite).
- Add a small line under the CTA: *"Your data stays private. Sharing is opt-in."*
**Why now:** Cuts "what is this?" questions from the next round of tests. Pure copy, no code.

**Total Q1–Q4: ~3.5 hours. Ships in this commit.**

---

## Sequential roadmap (next sessions)

Each item is sized against the existing 3,494-line `app.js` + 1,599-line `index.html` + 1,022-line `worker/index.js`. Effort estimates assume one focused contributor.

### Phase A — Reorder the funnel so the report is the first visible payoff  *(feedback: value prop missing + dashboard to follow-up)*
**Effort: 1–2 days.** The biggest single structural change.
- New landing funnel: `Landing → Methodology (existing) → 6-step guided intake → Instant report → Account gate → Dashboard`.
- The instant report renders from the local state snapshot **without** requiring auth or a worker round-trip — same path the anonymous preview already uses, just made the *default*.
- Auth is now a downstream "save your history" gate, not a precondition to seeing the result.
- Risk: changes the meaning of "anonymous preview" (was a side feature, now the main path). Document the change in the README.

### Phase B — Replace document upload with manual aggregate fields  *(feedback: document upload friction + stealth-mode concern)*
**Effort: 1–1.5 days.** Independently shippable from A.
- Demote `/api/documents` from "required step" to "optional, incubator-only path" gated behind an explicit "I trust this environment" toggle.
- Replace upload-driven intake fields with structured aggregates already in the form (headcount, cloud spend, kWh, etc.).
- Net: `worker/index.js` documents endpoints stay, but the UI no longer asks. R2 binding still wired, dormant.
- Risk: if a real founder *wanted* to upload, the path becomes harder to find. Add a discoverable "upload evidence" link in the dashboard's right rail.

### Phase C — Hybrid assessment: step-by-step with visible progress + easy review  *(feedback: assessment format split + preset inputs over typing)*
**Effort: 1.5–2 days.**
- The current 3-step funnel becomes a 6-step horizontal wizard with: progress bar, step name, time estimate, and a "review all answers" review step before submit (Assessment 1's strength, in Assessment 2's flow).
- Convert remaining free-text fields to dropdowns/selects:
  - Business model → select (already partial)
  - Cloud provider → select (AWS / GCP / Azure / Other)
  - Hosting region → select (continent-level)
  - Primary activity → select (modeled per business model)
  - Energy source → select (grid mix categories)
- This is the chunkiest Phase-C piece. ~12 fields to convert, each with an "Other (specify)" escape hatch.

### Phase D — Dashboard vertical hierarchy  *(feedback: dashboard density + goals top)*
**Effort: 1 day.**
- Reorder dashboard sections top-to-bottom:
  1. Goals & milestones (grouped)
  2. Live footprint & handprint (current snapshot, no projection)
  3. Maturity level (compact, separate from metric cards)
  4. Risk radar
  5. Projection (collapsed by default)
  6. AI briefing
- The "four-card row" pattern (footprint / handprint / net / cost) gets split: footprint & handprint stay prominent; net & cost move to a "Details" expander.

### Phase E — Hybrid report: visual overview + expandable methodology  *(feedback: report format)*
**Effort: 1–1.5 days.**
- Default collapsed view: Report 2's infographic (one-page snapshot, benchmark band, KPI tiles).
- "Show methodology" / "Show evidence" expanders reveal Report 1's detail (factor sources, framework definitions, citations).
- This already exists partially in the report HTML; the work is reordering and adding explicit expander controls.

### Phase F — Tailored intake by business model  *(feedback: footprint/handprint confusion + SaaS/AI fit)*
**Effort: 1.5 days.** Builds on Phase C.
- Business model selection gates which intake steps appear, which defaults are pre-filled, and which default activities are shown.
- SaaS path: emphasizes cloud spend + headcount, de-emphasizes hardware, surfaces token/compute observability hooks.
- Hardware/manufacturing path: keeps hardware, energy, logistics prominence.
- Hybrid: both paths active with a toggle.

### Phase G — Privacy + sharing overhaul  *(feedback: LinkedIn sharing + privacy)*
**Effort: 0.5 day.** Builds on Q3.
- Expand Q3's consent gate into a full privacy model: per-report visibility (private / link-only / public), default = private.
- LinkedIn share button auto-generates a **positive** summary (lowest-footprint or biggest-improvement metric) — never shares a number the founder wouldn't want public.
- "Investor-only" link mode: time-limited token-protected URL, distinct from public.

### Phase H — Targeted re-tests  *(feedback: testing methodology)*
**Effort: ongoing, not code.** Required before Phase A is "done".
- Recruit ≥3 more Seed/Series A climate-tech founders.
- Run **three separate sessions**, not one: (1) terminology comprehension, (2) assessment navigation, (3) document trust. Don't combine.
- Recruit at least one founder-role participant per session (not just observers).
- Re-test after Phase A ships; then again after Phase C; then after Phase E.

### Out of scope (recorded as future, per feedback)
- **Leaderboard / gamification** — Amali's request. Requires definition work + privacy framework. Not MVP.
- **Larger-company segment** — Caroline & Brian's suggestion. Different product, different personas. Future research path.

---

## Sequencing rationale

```
Q1 ─ Q2 ─ Q3 ─ Q4   (this commit, 1 session)
  ↓
Phase A  (1–2d)   ← biggest UX risk; do first while feedback is fresh
  ↓
Phase C  (1.5–2d) ← unblocks Phase F
  ↓
Phase D  (1d)     ← unblocks Phase E
  ↓
Phase E  (1–1.5d) ← unblocks Phase G
  ↓
Phase B  (1–1.5d) ← independent; can run in parallel with C/D
  ↓
Phase F  (1.5d)   ← needs C as prerequisite
  ↓
Phase G  (0.5d)   ← needs Q3 + Phase E
  ↓
Phase H  (re-test) ← after each of A, C, E
```

**Total remaining: ~9–12 working days** for Phases A–G, plus 2–3 re-test cycles of Phase H.

---

## What this plan deliberately does NOT do

- **No new abstraction layer** in `app.js` for "step engine". The current screen-by-screen state machine is fine for a 6-step wizard. Adding a generic step framework would double the LOC for no user benefit at this scale.
- **No redesign of the AI briefing.** It already cites sources from the fact pack; testers didn't flag it. Don't touch what works.
- **No migration to a framework** (React, Svelte, etc.). The vanilla-ES-module SPA is the deliberate stack and the LOC is manageable.
- **No backend changes** for the quick wins. The worker stays untouched in this commit. Backend changes only land in Phases B and G.
