import { NextRequest, NextResponse } from 'next/server';
import { withUser } from '@/lib/auth';
import { initSchema } from '@/lib/schema';
import { randomBytes } from 'crypto';
import db from '@/lib/db';

export const GET = withUser(async (_req: NextRequest, userId: string) => {
  await initSchema();
  const hooks = await db.prepare('SELECT id, url, events, active, created_at FROM webhooks WHERE user_id = ?').all(userId);
  return NextResponse.json(hooks);
});

export const POST = withUser(async (req: NextRequest, userId: string) => {
  await initSchema();
  const { url, events, secret } = await req.json();
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
  const sec = secret || randomBytes(16).toString('hex');
  await db.prepare('INSERT INTO webhooks (user_id, url, events, secret) VALUES (?,?,?,?)').run(userId, url, events || '*', sec);
  return NextResponse.json({ ok: true, secret: sec });
});

export const DELETE = withUser(async (req: NextRequest, userId: string) => {
  await initSchema();
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await db.prepare('DELETE FROM webhooks WHERE id = ? AND user_id = ?').run(id, userId);
  return NextResponse.json({ ok: true });
});
