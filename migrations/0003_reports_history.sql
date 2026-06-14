-- Migration 0003: Report History table
-- Stores historical snapshots of startup carbon footprint assessments, benchmarks, and AI briefings.

CREATE TABLE IF NOT EXISTS reports_history (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  state_json      TEXT NOT NULL, -- Full JSON snapshot of the workspace state
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reports_history_user ON reports_history(user_id);
