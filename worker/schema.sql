-- D1 schema for the Lanyards & Dragons capture endpoint.
CREATE TABLE IF NOT EXISTS contacts (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  email   TEXT,
  token   TEXT,           -- random, client-held; used for self-service deletion
  consent INTEGER,
  source  TEXT,
  ts      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_contacts_token ON contacts(token);

CREATE TABLE IF NOT EXISTS suggestions (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  text      TEXT,
  client_id TEXT,
  ts        INTEGER
);

CREATE TABLE IF NOT EXISTS events (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  type      TEXT,
  client_id TEXT,         -- anonymous random id (no PII)
  level     TEXT,
  packets   INTEGER,
  ts        INTEGER
);
