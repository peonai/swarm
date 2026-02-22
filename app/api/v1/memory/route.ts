export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import db, { isPg } from '@/lib/db';
import { initSchema, logAudit } from '@/lib/schema';
import { withAuthOrAdmin } from '@/lib/auth';
import { embed, cosine } from '@/lib/embedding';

export const GET = withAuthOrAdmin(async (req, agent) => {
  await initSchema();
  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q');
  const tag = searchParams.get('tag');
  const type = searchParams.get('type');
  const entity = searchParams.get('entity');
  const since = searchParams.get('since');
  const limit = Number(searchParams.get('limit') || 50);

  const mode = searchParams.get('mode'); // 'semantic' | null (default: fts)

  // Semantic search mode
  if (q && mode === 'semantic') {
    const qVec = await embed(q, agent.userId);
    const all = await db.prepare('SELECT * FROM memories WHERE user_id = ? AND embedding IS NOT NULL ORDER BY created_at DESC')
      .all(agent.userId) as any[];
    const scored = all.map(m => ({ ...m, score: cosine(qVec, JSON.parse(m.embedding)) }))
      .sort((a, b) => b.score - a.score).slice(0, limit);
    return NextResponse.json(scored.map(r => ({
      ...r, embedding: undefined,
      tags: r.tags?.split(',').filter(Boolean) || [],
      entities: r.entities?.split(',').filter(Boolean) || [],
    })));
  }

  let sql: string, params: any[];

  if (q) {
    const hasCJK = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(q);
    if (isPg) {
      sql = hasCJK
        ? `SELECT * FROM memories WHERE user_id = ? AND content LIKE ? ORDER BY created_at DESC LIMIT ?`
        : `SELECT *, ts_rank(to_tsvector('english', content), plainto_tsquery('english', ?)) AS rank
           FROM memories WHERE user_id = ? AND to_tsvector('english', content) @@ plainto_tsquery('english', ?)
           ORDER BY rank DESC LIMIT ?`;
      params = hasCJK ? [agent.userId, `%${q}%`, limit] : [q, agent.userId, q, limit];
    } else {
      if (hasCJK) {
        sql = `SELECT * FROM memories WHERE user_id = ? AND content LIKE ? ORDER BY created_at DESC LIMIT ?`;
        params = [agent.userId, `%${q}%`, limit];
      } else {
        sql = `SELECT m.*, rank FROM memories m JOIN memories_fts ON memories_fts.rowid = m.id
          WHERE m.user_id = ? AND memories_fts MATCH ? ORDER BY rank LIMIT ?`;
        params = [agent.userId, q, limit];
      }
    }
  } else {
    sql = 'SELECT * FROM memories WHERE user_id = ?';
    params = [agent.userId];
    if (tag) { sql += ' AND tags LIKE ?'; params.push(`%${tag}%`); }
    if (type) { sql += ' AND type = ?'; params.push(type); }
    if (entity) { sql += ' AND entities LIKE ?'; params.push(`%${entity}%`); }
    if (since) { sql += ' AND created_at >= ?'; params.push(since); }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
  }

  const rows = await db.prepare(sql).all(...params) as any[];
  return NextResponse.json(rows.map(r => ({
    ...r,
    tags: r.tags?.split(',').filter(Boolean) || [],
    entities: r.entities?.split(',').filter(Boolean) || [],
  })));
});

export const POST = withAuthOrAdmin(async (req, agent) => {
  await initSchema();
  if (!agent.permissions.includes('write')) return NextResponse.json({ error: 'No write permission' }, { status: 403 });
  const { key, content, tags, type, importance, entities } = await req.json();
  if (!content) return NextResponse.json({ error: 'Missing content' }, { status: 400 });

  const tagsStr = Array.isArray(tags) ? tags.join(',') : tags || null;
  const entStr = Array.isArray(entities) ? entities.join(',') : entities || null;

  await db.prepare(`INSERT INTO memories (user_id, key, content, source, tags, type, importance, entities, embedding)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(agent.userId, key || null, content, agent.id, tagsStr, type || 'observation', importance ?? 0.5, entStr, null);

  // Background embed — don't block response
  embed(content, agent.userId).then(async vec => {
    const rows = await db.prepare('SELECT id FROM memories WHERE user_id = ? AND content = ? ORDER BY id DESC LIMIT 1').all(agent.userId, content) as any[];
    if (rows[0]) await db.prepare('UPDATE memories SET embedding = ? WHERE id = ?').run(JSON.stringify(vec), rows[0].id);
  }).catch(() => {});

  await logAudit(agent.userId, agent.id, 'memory.write', 'memory', key || undefined, content.slice(0, 100));
  return NextResponse.json({ ok: true });
});

export const DELETE = withAuthOrAdmin(async (req, agent) => {
  await initSchema();
  if (!agent.permissions.includes('write')) return NextResponse.json({ error: 'No write permission' }, { status: 403 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await db.prepare('DELETE FROM memories WHERE id = ? AND user_id = ?').run(id, agent.userId);
  await logAudit(agent.userId, agent.id, 'memory.delete', 'memory', String(id));
  return NextResponse.json({ ok: true });
});
