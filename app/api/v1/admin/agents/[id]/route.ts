export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { initSchema } from '@/lib/schema';
import { withUser } from '@/lib/auth';

export const DELETE = withUser(async (req, userId, _role) => {
  await initSchema();
  const id = req.nextUrl.pathname.split('/').pop() ?? '';
  await db.prepare('DELETE FROM agents WHERE id = ? AND user_id = ?').run(id, userId);
  return NextResponse.json({ ok: true });
});
