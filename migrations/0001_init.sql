-- Climate Impact Dashboard — initial schema
-- Accounts, sessions, per-user workspace state, and uploaded document metadata.

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  pw_hash     TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- One JSON blob of dashboard state per user (company, metrics, claims, goals, ...).
CREATE TABLE IF NOT EXISTS workspaces (
  user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  state_json  TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Metadata for uploaded documents; bytes live in R2 under r2_key.
CREATE TABLE IF NOT EXISTS documents (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind          TEXT,                 -- 'deck' | 'accounting' | 'evidence'
  name          TEXT NOT NULL,
  size          INTEGER,
  content_type  TEXT,
  r2_key        TEXT NOT NULL,
  uploaded_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
