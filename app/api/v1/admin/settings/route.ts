export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withAdmin, withUser } from '@/lib/auth';
import { initSchema } from '@/lib/schema';
import db from '@/lib/db';

async function getSettings(userId: string) {
  await initSchema();
  const rows = await db.prepare('SELECT key, value FROM user_settings WHERE user_id = ?').all(userId) as any[];
  const m: Record<string, string> = {};
  for (const r of rows) m[r.key] = r.value;
  return m;
}

async function setSetting(userId: string, key: string, value: string) {
  await initSchema();
  await db.prepare('INSERT INTO user_settings (user_id, key, value) VALUES (?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value').run(userId, key, value);
}

export const GET = withUser(async (_req, userId, role) => {
  const user = await getSettings(userId);
  const global = await getSettings('__global__');
  const embedding = {
    url: user.embed_url || global.embed_url || process.env.EMBED_URL || '',
    model: user.embed_model || global.embed_model || process.env.EMBED_MODEL || '',
    enabled: !!(user.embed_url || global.embed_url || process.env.EMBED_URL),
  };
  const res: any = { embedding, port: process.env.PORT || '3777' };
  if (role === 'admin') {
    res.adminToken = process.env.SWARM_ADMIN_TOKEN || 'swarm-admin-dev';
    res.globalEmbedding = {
      url: global.embed_url || process.env.EMBED_URL || '',
      model: global.embed_model || process.env.EMBED_MODEL || '',
    };
  }
  return NextResponse.json(res);
});

export const PATCH = withUser(async (req, userId, role) => {
  const { embedding, scope } = await req.json();
  if (!embedding) return NextResponse.json({ error: 'Missing embedding' }, { status: 400 });
  const target = (scope === 'global' && role === 'admin') ? '__global__' : userId;
  if (embedding.url !== undefined) await setSetting(target, 'embed_url', embedding.url);
  if (embedding.key !== undefined) await setSetting(target, 'embed_key', embedding.key);
  if (embedding.model !== undefined) await setSetting(target, 'embed_model', embedding.model);
  return NextResponse.json({ ok: true });
});
