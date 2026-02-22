import { NextRequest, NextResponse } from 'next/server';
import { initSchema } from '@/lib/schema';
import { hashPassword } from '@/lib/password';
import db from '@/lib/db';

export async function GET() {
  await initSchema();
  const user = await db.prepare('SELECT id FROM users LIMIT 1').get() as any;
  return NextResponse.json({ initialized: !!user });
}

export async function POST(req: NextRequest) {
  await initSchema();
  const existing = await db.prepare('SELECT id FROM users LIMIT 1').get() as any;
  if (existing) return NextResponse.json({ error: 'Already initialized' }, { status: 400 });

  const { username, password, name } = await req.json();
  if (!username || !password) return NextResponse.json({ error: 'Username and password required' }, { status: 400 });

  const hash = hashPassword(password);
  const apiToken = `swarm_${crypto.randomUUID().replace(/-/g, '')}`;
  await db.prepare('INSERT INTO users (id, name, email, password_hash, role, api_token) VALUES (?,?,?,?,?,?)').run(username, name || username, username, hash, 'admin', apiToken);
  return NextResponse.json({ ok: true, userId: username });
}
