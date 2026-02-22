export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { initSchema } from '@/lib/schema';
import { withUser } from '@/lib/auth';

export const GET = withUser(async (req, userId, _role) => {
  await initSchema();
  const { searchParams } = req.nextUrl;
  const limit = Number(searchParams.get('limit') || 50);
  const action = searchParams.get('action');
  const agent = searchParams.get('agent');

  let sql = 'SELECT * FROM audit_log WHERE user_id = ?';
  const params: any[] = [userId];
  if (action) { sql += ' AND action = ?'; params.push(action); }
  if (agent) { sql += ' AND agent_id = ?'; params.push(agent); }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  const rows = await db.prepare(sql).all(...params);
  return NextResponse.json(rows);
});
