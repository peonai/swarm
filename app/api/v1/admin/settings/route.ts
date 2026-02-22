export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { withAdmin, withUser } from '@/lib/auth';
import { getEmbeddingConfig } from '@/lib/embedding';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ENV_PATH = join(process.cwd(), '.env.local');

function readEnv(): Record<string, string> {
  if (!existsSync(ENV_PATH)) return {};
  const lines = readFileSync(ENV_PATH, 'utf8').split('\n');
  const env: Record<string, string> = {};
  for (const l of lines) {
    const m = l.match(/^([^=]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

function writeEnv(env: Record<string, string>) {
  writeFileSync(ENV_PATH, Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n') + '\n');
}

export const GET = withUser(async (_req, _userId, role) => {
  const base: any = { embedding: getEmbeddingConfig(), port: process.env.PORT || '3777' };
  if (role === 'admin') base.adminToken = process.env.SWARM_ADMIN_TOKEN || 'swarm-admin-dev';
  return NextResponse.json(base);
});

export const PATCH = withAdmin(async (req) => {
  const { embedding } = await req.json();
  if (!embedding) return NextResponse.json({ error: 'Missing embedding' }, { status: 400 });

  const env = readEnv();
  if (embedding.url !== undefined) { env.EMBED_URL = embedding.url; process.env.EMBED_URL = embedding.url; }
  if (embedding.key !== undefined) { env.EMBED_KEY = embedding.key; process.env.EMBED_KEY = embedding.key; }
  if (embedding.model !== undefined) { env.EMBED_MODEL = embedding.model; process.env.EMBED_MODEL = embedding.model; }
  writeEnv(env);

  return NextResponse.json({ ok: true });
});
