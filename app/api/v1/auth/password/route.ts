import { NextRequest, NextResponse } from 'next/server';
import { withUser } from '@/lib/auth';
import { verifyPassword, hashPassword } from '@/lib/password';
import db from '@/lib/db';

export const PUT = withUser(async (req: NextRequest, userId: string) => {
  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) return NextResponse.json({ error: 'Missing currentPassword or newPassword' }, { status: 400 });
  if (newPassword.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

  const user = await db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as any;
  if (!user?.password_hash) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (!verifyPassword(currentPassword, user.password_hash)) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });

  await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(newPassword), userId);
  return NextResponse.json({ ok: true, message: 'Password changed' });
});
