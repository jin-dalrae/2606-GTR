# Climatico — Climate Impact Dashboard

A two-sided environmental-impact dashboard for early-stage climate-tech startups.
It models a company's **footprint** (emissions it causes) against its **handprint**
(emissions its product helps avoid), gates handprint claims on **additionality**,
and turns the result into a founder-facing report with an AI briefing, a risk
radar, peer benchmarks, and a cost-exposure estimate.

Every number is **modeled, sourced, and traceable** — defaults are clearly labelled
as estimates to be replaced with measured data, and each one cites the methodology
behind it.

---

## Stack

Full-stack on **Cloudflare Workers**. A single Worker serves the JSON API under
`/api/*` and falls back to the static SPA for everything else.

| Layer    | Tech |
|----------|------|
| Frontend | Vanilla ES-module SPA (`app.js`, `index.html`, `index.css`), built with **Vite 6** |
| Backend  | `worker/index.js` — hand-rolled router, no framework |
| Database | Cloudflare **D1** (SQLite) — accounts, sessions, per-user workspace state, document metadata |
| Storage  | Cloudflare **R2** — uploaded document bytes |
| AI       | **Gemini** via a Secrets Store binding — report + risk-radar generation |
| Tests    | **Vitest** |

---

## Project layout

```
app.js              SPA application logic (state, funnel, dashboard, report rendering)
index.html          SPA markup (landing funnel + dashboard shell)
index.css           Styles
data/evidence.js    Shared, curated evidence library (imported by BOTH frontend + worker)
data/insights.js    Maturity-conditional insight table L0-L5 (deterministic + hybrid AI grounding)
worker/index.js     Worker API: auth, state, documents, AI report generation
migrations/         D1 schema migrations
app.test.js         Vitest suite (math, AI grounding, impact/cost helpers, insights)
wrangler.jsonc      Worker config + bindings (D1, R2, Secrets Store, static assets)
dist/               Vite build output (served as static assets; git-ignored)
```

### `data/evidence.js` — the evidence backbone

A single source of truth for the *backing* behind everything the product claims,
imported by both the frontend (for rendering) and the Worker (for AI grounding):

- **`FACTOR_SOURCES`** — provenance for each emission factor (source, publisher, year, URL, methodology, derivation basis).
- **`FRAMEWORKS`** — the standards/theory it rests on (GHG Protocol, SBTi, SCI, Project Frame, additionality, rebound effect).
- **`BENCHMARKS` / `computeBenchmark()`** — transparent peer ranges (per-FTE factor × headcount), sourced and labelled indicative.
- **`CARBON_PRICES` / `priceFootprint()`** — translates tonnes into a `$` cost band (EU ETS compliance price + EPA social cost of carbon).
- **`IMPACT_DIMENSIONS` / `computeImpactProfile()`** — impact beyond CO₂: energy, water, and waste are *modeled* (derived from the carbon model); land & biodiversity is a *qualitative* materiality flag.
- **`CASE_PRECEDENTS`** — real, dated, cited precedents behind the risks raised (CSRD, California SB 253/261, the Jevons/rebound evidence base, greenwashing scrutiny).
- **`buildFactPack()`** — assembles the curated facts relevant to one assessment into a citation-ready block for the AI prompt.

**Honesty rules baked in:** every entry names a real public source + URL; defaults
are always labelled modeled, never measured; benchmarks state they are derived
ranges; regulatory precedents carry a status/date because regulation moves; and
the AI is constrained to cite **only** sources from the fact pack — never to invent
a citation, statistic, or URL.

### `data/insights.js` — the maturity-conditional insight table

A status-aware insight layer that pairs with `data/evidence.js`. Where the
evidence library answers *"what is true and where does it come from?"*, the
insight table answers *"what should this user do next, given their maturity?"*

- **`MATURITY_INSIGHTS`** — six deterministic rows, one per maturity level (L0 Unmapped → L5 Improved). Each row carries a `headline`, a `firstAction`, an `unlocksMilestone` (the in-app event that promotes the user to the next level), and a list of `evidenceCitations` resolved against real URLs via `sourceLinks()`.
- **`selectInsight(state)`** — clamps `state.maturityLevel` to `[0,5]` and returns the matching row.
- **`buildInsightContext(state)`** — emits a machine-readable block the AI prompt embeds verbatim, with the deterministic `firstAction` flagged as binding.

**Hybrid mode (deterministic + AI):** the dashboard's *"Where You Are"* widget
renders the deterministic headline + first action directly from this table —
no LLM involvement, no drift. The Gemini report prompt receives the same
context and is instructed to align its `firstAction` with the deterministic
one (not contradict it), so the AI briefing elaborates on the level's required
evidence instead of improvising a new direction.

| Level | Title | First action (binding) | Evidence anchor |
|---|---|---|---|
| L0 | Unmapped | Pick the activity that represents your largest expected emission to anchor your first snapshot | GHG Protocol Corporate + Scope 3 Standard |
| L1 | Mapped | Replace one modeled input with measured data (utility bill, cloud kWh, travel receipts) | GHG Protocol ICT + SCI spec |
| L2 | Gated | Commit to a 1.5°C-aligned reduction target investors recognize (typically SBTi) | Science Based Targets initiative |
| L3 | Metered | Verify your top hotspot with a full lifecycle methodology (ISO 14040/14044 or GHG Protocol Product Standard) | ISO 14040/14044 + GHG Protocol Product Standard |
| L4 | Active | Gate handprint claims on additionality — the test that the reduction would not have happened anyway | Additionality + Project Frame |
| L5 | Improved | Get external verification before publishing any avoided-emissions or net-positive claim | EU Green Claims Directive / Project Frame |

**Honesty rules baked in:** every citation label resolves to a real URL via
`sourceLinks()`; first actions reference existing in-app milestones so the
promotion to the next level is observable, not aspirational; and the AI is
explicitly forbidden from contradicting the deterministic headline.

### Foundation Model / Enterprise AI Handling

The platform intelligently supports massive AI data foundries and foundation model companies without relying on hardcoded overrides. Users can flag themselves as "Foundation Model / Heavy Compute" during intake. This applies a 1000x multiplier to standard compute estimates and automatically injects an RLHF/Data Annotation workforce footprint (25,000 tCO2e/yr) into their baseline, ensuring their operational reality isn't grossly underestimated by standard SME per-capita scaling logic.

---

## API

All API routes live under `/api/*`; everything else serves the SPA.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/signup` | Create account (PBKDF2-hashed password), set session cookie |
| POST | `/api/login` | Authenticate, set session cookie |
| POST | `/api/logout` | Clear session |
| GET  | `/api/me` | Current account |
| GET  | `/api/state` | Load the user's workspace JSON blob |
| PUT  | `/api/state` | Save the user's workspace JSON blob |
| POST | `/api/generate-report` | Generate the AI report/briefing (Gemini), grounded in the fact pack |
| GET  | `/api/reports` | List all historical report snapshots saved for the user |
| POST | `/api/reports` | Save a new historical report snapshot of the current state |
| GET  | `/api/reports/:id` | Fetch the full state JSON of a specific report snapshot |
| DELETE | `/api/reports/:id` | Delete a saved report snapshot |
| GET/POST | `/api/documents` | List / upload document metadata (bytes in R2) |
| GET/DELETE | `/api/documents/:id` | Fetch / delete a document |
| GET  | `/api/admin/stats` | (Admin Only) High-level platform statistics (users, workspaces, documents, reports, tokens) |
| GET  | `/api/admin/token-logs` | (Admin Only) Historical AI token usage logs across the platform |

**Auth:** PBKDF2 (WebCrypto) password hashing with a timing-safe comparison;
HttpOnly / Secure / SameSite=Lax session cookies.

**Anonymous previews:** logged-out visitors can generate a limited *preview*
report. A daily quota is enforced per client IP (`anonymous_report_limits` table).

**Web grounding:** the report fetches the submitted public website for context
behind SSRF guards (blocked private/local hosts, size-capped reads, timeout),
then enables Gemini Google Search grounding for company-specific environmental
issues, recent news, and analogous peer-company incidents. Search queries and
web sources are surfaced in the AI briefing when Gemini returns grounding
metadata.

**Maturity-conditional grounding:** the report also receives the user's current
maturity-level insight from `data/insights.js` and is constrained to align its
`firstAction` with the deterministic recommendation (not contradict it). The
dashboard's *"Where You Are"* widget shows the same insight deterministically,
independent of whether the AI briefing has been generated.

---

## Product flow

- **Landing → Dedicated Methodology → Onboarding → Instant Report** is the pre-login funnel.
  - The methodology section is separated into its own dedicated screen in the funnel.
- **Log in** (topbar) takes an existing account holder straight to their dashboard.
- **"Have an invite?"** routes invited teammates to the **free assessment** — an
  invitation grants the assessment, not direct access to someone else's dashboard.
  `?invite=` deep links behave the same way.
- The report shows: modeled footprint + hotspots, **impact beyond carbon**, a
  **peer benchmark** band, a **cost-exposure** estimate, **relevant precedents**,
  a sourced **methodology** breakdown, and an **AI briefing** with cited sources.
- The Goals view surfaces a **"Where You Are"** widget — the maturity-conditional
  insight from `data/insights.js` — that selects a deterministic headline + first
  action + evidence citations keyed to the user's current maturity level. The AI
  briefing elaborates on this same direction rather than improvising its own.
- **Report History:** Users can save, delete, and open historical report snapshots of their startup's assessments directly inside the dashboard.


---

## Development

```bash
npm install

# Frontend only (fast iteration, no Worker/API):
npm run dev

# Full stack locally (Worker + API + D1 + R2 + static assets):
npm run build
npx wrangler dev

# Tests:
npm test
```

> `npm run dev` serves the SPA via Vite but does not run the Worker, so `/api/*`
> calls won't resolve. Use `npx wrangler dev` for end-to-end local testing. The
> app is offline-first and falls back to `localStorage` when the API is
> unavailable.

### Database migrations

```bash
npx wrangler d1 migrations apply gtr            # local
npx wrangler d1 migrations apply gtr --remote   # production
```

---

## Deployment

```bash
npm run build
npx wrangler deploy
```

### Secrets

The Gemini API key is read from a **Secrets Store** binding (`AI_API_KEY`, see
`wrangler.jsonc`). If the key is absent, `/api/generate-report` returns a clear
503 and the modeled snapshot still renders.

> ⚠️ **Never commit secrets.** `.env` and `.wrangler/` are git-ignored. The local
> Wrangler secrets-store state lives under `.wrangler/` — do not track it. If a key
> is ever exposed, rotate it in the Google/Cloudflare console immediately.

---

## Disclaimers

The first report is a **directional model** built from industry-default factors
and your inputs — a starting point, not certified carbon accounting. Footprints
and avoided handprints use separate accounting baselines: netting them is
descriptive, not an offset. Cost-exposure and impact-beyond-carbon figures are
illustrative forward-looking estimates. Replace defaults with measured data inside
the dashboard to improve accuracy.
