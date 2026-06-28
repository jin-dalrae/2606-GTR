-- Public, tokenized share records for the report share card.
-- Stores ONLY public-safe grades/bands (grades_json) — never raw tCO2e.
-- Anonymous-friendly: no user_id, keyed by a random token. Revocable by token.
CREATE TABLE IF NOT EXISTS shared_reports (
  token        TEXT PRIMARY KEY,
  company_name TEXT,
  grades_json  TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
