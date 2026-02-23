import { NextRequest, NextResponse } from 'next/server';
import { initSchema } from '@/lib/schema';
import { hashPassword } from '@/lib/password';
import db from '@/lib/db';
import { withAdmin } from '@/lib/auth';

export const GET = withAdmin(async () => {
  await initSchema();
  const users = await db.prepare('SELECT id, name, email, role, api_token, disabled, created_at FROM users ORDER BY created_at').all() as any;
  return NextResponse.json(users);
});

export const POST = withAdmin(async (req: NextRequest) => {
  await initSchema();
  const { username, password, name, role } = await req.json();
  if (!username || !password) return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  const exists = await db.prepare('SELECT id FROM users WHERE id = ?').get(username) as any;
  if (exists) return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  const hash = hashPassword(password);
  const apiToken = `swarm_${crypto.randomUUID().replace(/-/g, '')}`;
  await db.prepare('INSERT INTO users (id, name, email, password_hash, role, api_token) VALUES (?,?,?,?,?,?)')
    .run(username, name || username, username, hash, role || 'user', apiToken);
  return NextResponse.json({ ok: true, userId: username });
});

export const PATCH = withAdmin(async (req: NextRequest) => {
  const { id, action, password } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  if (action === 'disable') await db.prepare('UPDATE users SET disabled = 1 WHERE id = ?').run(id);
  else if (action === 'enable') await db.prepare('UPDATE users SET disabled = 0 WHERE id = ?').run(id);
  else if (action === 'reset_password') {
    if (!password || password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(password), id);
    return NextResponse.json({ ok: true, message: 'Password reset' });
  } else if (action === 'reset_token') {
    const newToken = `swarm_${crypto.randomUUID().replace(/-/g, '')}`;
    await db.prepare('UPDATE users SET api_token = ? WHERE id = ?').run(newToken, id);
    return NextResponse.json({ ok: true, api_token: newToken });
  } else return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  return NextResponse.json({ ok: true });
});

export const DELETE = withAdmin(async (req: NextRequest) => {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  await db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
});
