CREATE TABLE IF NOT EXISTS site_content (
  kind TEXT PRIMARY KEY CHECK (kind IN ('draft', 'published')),
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
