CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  site_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  session_id TEXT,
  language TEXT,
  question_type TEXT,
  has_custom_topic INTEGER DEFAULT 0,
  reading_mode TEXT,
  path TEXT,
  timezone TEXT,
  browser_locale TEXT,
  browser_region TEXT,
  country TEXT,
  detail TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at);
CREATE INDEX IF NOT EXISTS idx_events_event_name ON events (event_name);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events (session_id);
CREATE INDEX IF NOT EXISTS idx_events_language ON events (language);
CREATE INDEX IF NOT EXISTS idx_events_question_type ON events (question_type);
