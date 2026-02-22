/* db.ts — dual backend: SQLite (dev) / PostgreSQL (prod)
   All methods return Promises for uniform async interface */
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

export interface Stmt {
  run(...p: any[]): Promise<any>;
  get(...p: any[]): Promise<any>;
  all(...p: any[]): Promise<any[]>;
}

export interface DB {
  exec(sql: string): Promise<void>;
  prepare(sql: string): Stmt;
}

let _db: DB | null = null;

function getDb(): DB {
  if (_db) return _db;

  if (DATABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: DATABASE_URL });
    _db = {
      async exec(sql: string) { await pool.query(sql); },
      prepare(sql: string) {
        let idx = 0;
        const pgSql = sql.replace(/\?/g, () => `$${++idx}`);
        return {
          async run(...params: any[]) { return pool.query(pgSql, params); },
          async get(...params: any[]) { const r = await pool.query(pgSql, params); return r.rows[0] || null; },
          async all(...params: any[]) { const r = await pool.query(pgSql, params); return r.rows; },
        };
      },
    };
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require('node:sqlite');
    const DB_PATH = process.env.SWARM_DB_PATH || join(process.cwd(), 'data/swarm.db');
    mkdirSync(dirname(DB_PATH), { recursive: true });
    const sqlite = new DatabaseSync(DB_PATH);
    sqlite.exec('PRAGMA journal_mode = WAL');
    sqlite.exec('PRAGMA foreign_keys = ON');
    _db = {
      async exec(sql: string) { sqlite.exec(sql); },
      prepare(sql: string) {
        const stmt = sqlite.prepare(sql);
        return {
          async run(...p: any[]) { return stmt.run(...p); },
          async get(...p: any[]) { return stmt.get(...p); },
          async all(...p: any[]) { return stmt.all(...p); },
        };
      },
    };
  }
  return _db;
}

const db: DB = new Proxy({} as DB, {
  get(_, prop: keyof DB) { return getDb()[prop].bind(getDb()); },
});

export default db;
export const isPg = !!DATABASE_URL;
