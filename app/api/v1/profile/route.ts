export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import db, { isPg } from '@/lib/db';
import { initSchema, logAudit, logProfileHistory } from '@/lib/schema';
import { withAuth } from '@/lib/auth';
import { fireWebhooks } from '@/lib/webhooks';

const NOW = isPg ? 'NOW()' : "datetime('now')";

export const GET = withAuth(async (req, agent) => {
  await initSchema();
  const layer = req.nextUrl.searchParams.get('layer');
  const tag = req.nextUrl.searchParams.get('tag');

  let sql = 'SELECT layer, key, value, confidence, source, tags, expires_at, updated_at FROM profiles WHERE user_id = ?';
  const params: any[] = [agent.userId];
  sql += ` AND (expires_at IS NULL OR expires_at > ${NOW})`;
  if (layer) { sql += ' AND layer = ?'; params.push(layer); }
  if (tag) { sql += ' AND tags LIKE ?'; params.push(`%${tag}%`); }
  sql += ' ORDER BY layer, key';

  const rows = await db.prepare(sql).all(...params) as any[];
  const profile: Record<string, Record<string, any>> = {};
  for (const r of rows) {
    if (!profile[r.layer]) profile[r.layer] = {};
    profile[r.layer][r.key] = {
      value: JSON.parse(r.value), confidence: r.confidence,
      source: r.source, tags: r.tags?.split(',').filter(Boolean) || [],
      expiresAt: r.expires_at, updatedAt: r.updated_at,
    };
  }
  return NextResponse.json(profile);
});

export const PATCH = withAuth(async (req, agent) => {
  await initSchema();
  if (!agent.permissions.includes('write')) return NextResponse.json({ error: 'No write permission' }, { status: 403 });
  const { layer, entries } = await req.json();
  if (!layer || !entries) return NextResponse.json({ error: 'Missing layer or entries' }, { status: 400 });

  const upsertSql = isPg
    ? `INSERT INTO profiles (user_id, layer, key, value, confidence, source, tags, expires_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON CONFLICT(user_id, layer, key) DO UPDATE SET value=EXCLUDED.value, confidence=EXCLUDED.confidence,
       source=EXCLUDED.source, tags=EXCLUDED.tags, expires_at=EXCLUDED.expires_at, updated_at=NOW()`
    : `INSERT INTO profiles (user_id, layer, key, value, confidence, source, tags, expires_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id, layer, key) DO UPDATE SET value=excluded.value, confidence=excluded.confidence,
       source=excluded.source, tags=excluded.tags, expires_at=excluded.expires_at, updated_at=excluded.updated_at`;

  for (const [key, val] of Object.entries(entries)) {
    const v = typeof val === 'object' && val !== null && 'value' in (val as any) ? (val as any) : { value: val };
    const tags = Array.isArray(v.tags) ? v.tags.join(',') : v.tags || null;
    // Get old value for history
    const old = await db.prepare('SELECT value FROM profiles WHERE user_id = ? AND layer = ? AND key = ?').get(agent.userId, layer, key) as any;
    await db.prepare(upsertSql).run(agent.userId, layer, key, JSON.stringify(v.value), v.confidence ?? 1.0, agent.id, tags, v.expiresAt || null);
    await logProfileHistory(agent.userId, layer, key, old?.value || null, JSON.stringify(v.value), agent.id);
  }
  await logAudit(agent.userId, agent.id, 'profile.update', 'profile', layer, `${Object.keys(entries).length} entries`);
  fireWebhooks(agent.userId, 'profile.updated', { layer, keys: Object.keys(entries), source: agent.id });
  return NextResponse.json({ ok: true });
});

export const DELETE = withAuth(async (req, agent) => {
  await initSchema();
  if (!agent.permissions.includes('write')) return NextResponse.json({ error: 'No write permission' }, { status: 403 });
  const { layer, key } = await req.json();
  if (!layer || !key) return NextResponse.json({ error: 'Missing layer or key' }, { status: 400 });
  const old = await db.prepare('SELECT value FROM profiles WHERE user_id = ? AND layer = ? AND key = ?').get(agent.userId, layer, key) as any;
  await db.prepare('DELETE FROM profiles WHERE user_id = ? AND layer = ? AND key = ?').run(agent.userId, layer, key);
  if (old) await logProfileHistory(agent.userId, layer, key, old.value, '(deleted)', agent.id);
  await logAudit(agent.userId, agent.id, 'profile.delete', 'profile', `${layer}.${key}`);
  return NextResponse.json({ ok: true });
});
