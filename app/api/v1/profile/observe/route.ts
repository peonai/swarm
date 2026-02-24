export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import db, { isPg } from '@/lib/db';
import { initSchema, logAudit } from '@/lib/schema';
import { withAuth } from '@/lib/auth';
import { fireWebhooks } from '@/lib/webhooks';

const NOW_SQL = isPg ? 'NOW()' : "datetime('now')";

export const POST = withAuth(async (req, agent) => {
  await initSchema();
  if (!agent.permissions.includes('write')) return NextResponse.json({ error: 'No write permission' }, { status: 403 });
  const { observations } = await req.json();
  if (!Array.isArray(observations)) return NextResponse.json({ error: 'Missing observations array' }, { status: 400 });

  const upsertSql = `INSERT INTO profiles (user_id, layer, key, value, confidence, source, tags, expires_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ${NOW_SQL})
    ON CONFLICT(user_id, layer, key) DO UPDATE SET
      value = CASE WHEN ${isPg ? 'EXCLUDED' : 'excluded'}.confidence > profiles.confidence THEN ${isPg ? 'EXCLUDED' : 'excluded'}.value ELSE profiles.value END,
      confidence = ${isPg ? `GREATEST(profiles.confidence, EXCLUDED.confidence)` : `MAX(profiles.confidence, excluded.confidence)`},
      source = CASE WHEN ${isPg ? 'EXCLUDED' : 'excluded'}.confidence > profiles.confidence THEN ${isPg ? 'EXCLUDED' : 'excluded'}.source ELSE profiles.source END,
      tags = COALESCE(${isPg ? 'EXCLUDED' : 'excluded'}.tags, profiles.tags),
      expires_at = COALESCE(${isPg ? 'EXCLUDED' : 'excluded'}.expires_at, profiles.expires_at),
      updated_at = ${NOW_SQL}`;

  for (const obs of observations) {
    const tags = Array.isArray(obs.tags) ? obs.tags.join(',') : obs.tags || null;
    const defaultExpiry = (obs.layer || 'context') === 'context' && !obs.expiresAt
      ? new Date(Date.now() + 86400000).toISOString() : null;
    await db.prepare(upsertSql).run(agent.userId, obs.layer || 'context', obs.key, JSON.stringify(obs.value),
      obs.confidence ?? 0.5, agent.id, tags, obs.expiresAt || defaultExpiry);
  }
  await logAudit(agent.userId, agent.id, 'profile.observe', 'profile', undefined, `${observations.length} observations`);
  fireWebhooks(agent.userId, 'profile.observed', { keys: observations.map((o: any) => o.key), source: agent.id });
  return NextResponse.json({ ok: true, count: observations.length });
});
