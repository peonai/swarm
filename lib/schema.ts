/* schema.ts — DB schema init, compatible with SQLite + PostgreSQL */
import db, { isPg } from './db';

const AUTO_ID = isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
const NOW = isPg ? 'NOW()' : "datetime('now')";
const TEXT_UNIQUE = isPg ? 'TEXT UNIQUE' : 'TEXT';

let _initialized = false;

export async function initSchema() {
  if (_initialized) return;
  _initialized = true;

  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT, email ${TEXT_UNIQUE},
    password_hash TEXT, role TEXT DEFAULT 'user',
    api_token TEXT UNIQUE, disabled INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (${NOW})
  )`);

  if (!isPg) {
    // SQLite migrations
    for (const sql of [
      'ALTER TABLE users ADD COLUMN email TEXT',
      'ALTER TABLE users ADD COLUMN password_hash TEXT',
      "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'",
      'ALTER TABLE users ADD COLUMN api_token TEXT',
      'ALTER TABLE users ADD COLUMN disabled INTEGER DEFAULT 0',
    ]) { try { await db.exec(sql); } catch {} }
    try { await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL'); } catch {}
  }

  await db.exec(`CREATE TABLE IF NOT EXISTS profiles (
    id ${AUTO_ID},
    user_id TEXT NOT NULL,
    layer TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL,
    confidence REAL DEFAULT 1.0, source TEXT, tags TEXT,
    expires_at TEXT, updated_at TEXT DEFAULT (${NOW}),
    UNIQUE(user_id, layer, key)
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
    name TEXT NOT NULL, api_key TEXT UNIQUE NOT NULL,
    permissions TEXT DEFAULT 'read', persona TEXT,
    created_at TEXT DEFAULT (${NOW})
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS memories (
    id ${AUTO_ID},
    user_id TEXT NOT NULL, key TEXT, content TEXT NOT NULL,
    source TEXT, tags TEXT, type TEXT DEFAULT 'observation',
    importance REAL DEFAULT 0.5, entities TEXT,
    created_at TEXT DEFAULT (${NOW})
  )`);

  if (!isPg) {
    // SQLite FTS5
    try {
      await db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
        content, tags, entities, key, content_rowid='id', content='memories'
      )`);
      await db.exec(`CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
        INSERT INTO memories_fts(rowid, content, tags, entities, key) VALUES (new.id, new.content, new.tags, new.entities, new.key);
      END`);
      await db.exec(`CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
        INSERT INTO memories_fts(memories_fts, rowid, content, tags, entities, key) VALUES ('delete', old.id, old.content, old.tags, old.entities, old.key);
      END`);
      await db.exec(`CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE ON memories BEGIN
        INSERT INTO memories_fts(memories_fts, rowid, content, tags, entities, key) VALUES ('delete', old.id, old.content, old.tags, old.entities, old.key);
        INSERT INTO memories_fts(rowid, content, tags, entities, key) VALUES (new.id, new.content, new.tags, new.entities, new.key);
      END`);
    } catch {}

    for (const sql of [
      "ALTER TABLE memories ADD COLUMN type TEXT DEFAULT 'observation'",
      'ALTER TABLE memories ADD COLUMN importance REAL DEFAULT 0.5',
      'ALTER TABLE memories ADD COLUMN entities TEXT',
      'ALTER TABLE memories ADD COLUMN embedding TEXT',
    ]) { try { await db.exec(sql); } catch {} }
  } else {
    // PostgreSQL full-text search index
    try {
      await db.exec(`CREATE INDEX IF NOT EXISTS idx_memories_fts ON memories USING gin(to_tsvector('english', content))`);
    } catch {}
  }

  // Audit log table
  await db.exec(`CREATE TABLE IF NOT EXISTS audit_log (
    id ${AUTO_ID},
    user_id TEXT NOT NULL,
    agent_id TEXT,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    detail TEXT,
    created_at TEXT DEFAULT (${NOW})
  )`);

  // Profile history table
  await db.exec(`CREATE TABLE IF NOT EXISTS profile_history (
    id ${AUTO_ID},
    user_id TEXT NOT NULL,
    layer TEXT NOT NULL,
    key TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    source TEXT,
    created_at TEXT DEFAULT (${NOW})
  )`);
}

export async function getAgentByKey(apiKey: string) {
  await initSchema();
  return db.prepare('SELECT id, user_id as "userId", permissions FROM agents WHERE api_key = ?').get(apiKey) as
    Promise<{ id: string; userId: string; permissions: string } | null>;
}

export async function getUserByToken(apiToken: string) {
  await initSchema();
  return db.prepare('SELECT id, id as "userId", role FROM users WHERE api_token = ? AND (disabled = 0 OR disabled IS NULL)').get(apiToken) as
    Promise<{ id: string; userId: string; role: string } | null>;
}

export async function ensureDefaultUser() {
  await initSchema();
  let user = await db.prepare('SELECT id FROM users LIMIT 1').get() as any;
  if (!user) {
    await db.prepare('INSERT INTO users (id, name) VALUES (?, ?)').run('default', 'Default User');
    return 'default';
  }
  return user.id;
}

export async function logAudit(userId: string, agentId: string | null, action: string, targetType: string, targetId?: string, detail?: string) {
  await db.prepare('INSERT INTO audit_log (user_id, agent_id, action, target_type, target_id, detail) VALUES (?,?,?,?,?,?)')
    .run(userId, agentId, action, targetType, targetId || null, detail || null);
}

export async function logProfileHistory(userId: string, layer: string, key: string, oldValue: string | null, newValue: string, source: string) {
  await db.prepare('INSERT INTO profile_history (user_id, layer, key, old_value, new_value, source) VALUES (?,?,?,?,?,?)')
    .run(userId, layer, key, oldValue, newValue, source);
}
