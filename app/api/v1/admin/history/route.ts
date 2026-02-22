export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { initSchema } from '@/lib/schema';
import { withUser } from '@/lib/auth';

export const GET = withUser(async (req, userId, _role) => {
  await initSchema();
  const { searchParams } = req.nextUrl;
  const limit = Number(searchParams.get('limit') || 50);
  const layer = searchParams.get('layer');
  const key = searchParams.get('key');

  let sql = 'SELECT * FROM profile_history WHERE user_id = ?';
  const params: any[] = [userId];
  if (layer) { sql += ' AND layer = ?'; params.push(layer); }
  if (key) { sql += ' AND key = ?'; params.push(key); }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  const rows = await db.prepare(sql).all(...params);
  return NextResponse.json(rows);
});
