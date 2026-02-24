import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { initSchema } from '@/lib/schema';
import { verifyPassword } from '@/lib/password';
import { JWT_SECRET } from '@/lib/jwt';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  await initSchema();
  const { username, password } = await req.json();
  if (!username || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });

  const user = await db.prepare('SELECT id, name, password_hash, role, api_token, disabled FROM users WHERE id = ? OR email = ?').get(username, username) as any;
  if (!user?.password_hash) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  if (user.disabled) return NextResponse.json({ error: 'Account disabled' }, { status: 403 });

  if (!verifyPassword(password, user.password_hash)) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = await new SignJWT({ userId: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return NextResponse.json({ token, user: { id: user.id, name: user.name, role: user.role, api_token: user.api_token } });
}
