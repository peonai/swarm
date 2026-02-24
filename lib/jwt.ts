import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

function resolve(): Uint8Array {
  if (process.env.SWARM_JWT_SECRET) return new TextEncoder().encode(process.env.SWARM_JWT_SECRET);
  const file = join(process.cwd(), 'data', 'jwt-secret');
  try { return new TextEncoder().encode(readFileSync(file, 'utf8').trim()); } catch {}
  const secret = randomBytes(32).toString('base64url');
  try { mkdirSync(join(process.cwd(), 'data'), { recursive: true }); writeFileSync(file, secret); } catch {}
  console.warn('⚠️  Auto-generated JWT secret. Set SWARM_JWT_SECRET in .env for production.');
  return new TextEncoder().encode(secret);
}

export const JWT_SECRET = resolve();
