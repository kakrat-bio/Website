-- Created automatically by functions/api/pitches/index.ts (ensurePitchesTable)
-- on first use, in the D1 database "kakrat-comments" (binding COMMENTS_DB).
-- Kept here as a record of the schema; running it by hand is harmless.
CREATE TABLE IF NOT EXISTS pitches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  track TEXT NOT NULL CHECK (track IN ('voices','guest','student')),
  name TEXT NOT NULL,
  byline TEXT NOT NULL,
  email TEXT NOT NULL,
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  outline TEXT NOT NULL,
  why_me TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','shortlisted','declined')),
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_pitches_status_created ON pitches(status, created_at);
