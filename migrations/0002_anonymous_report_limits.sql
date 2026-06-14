-- Daily anonymous AI preview quota, keyed by a per-day hash of the client IP.
CREATE TABLE IF NOT EXISTS anonymous_report_limits (
  day           TEXT NOT NULL,
  subject_hash  TEXT NOT NULL,
  count         INTEGER NOT NULL DEFAULT 0,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (day, subject_hash)
);
