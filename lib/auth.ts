import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getAgentByKey, getUserByToken } from './schema';

const JWT_SECRET = new TextEncoder().encode(process.env.SWARM_JWT_SECRET || 'swarm-dev-secret');

async function verifyJwt(token: string): Promise<{ userId: string; role?: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId ? { userId: payload.userId as string, role: payload.role as string } : null;
  } catch { return null; }
}

export function withAuth(handler: (req: NextRequest, agent: { id: string; userId: string; permissions: string }) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const key = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!key) return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
    const agent = await getAgentByKey(key);
    if (agent) return handler(req, agent);
    const user = await getUserByToken(key);
    if (user) return handler(req, { id: 'user:' + user.id, userId: user.userId, permissions: 'read,write' });
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  };
}

function isLocalRequest(req: NextRequest): boolean {
  const fwd = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = fwd || req.headers.get('x-real-ip') || '127.0.0.1';
  return ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'].includes(ip);
}

export function withAdmin(handler: (req: NextRequest, userId: string) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // Admin API only accessible from localhost (token auth) or via JWT (remote)
    const token = req.headers.get('x-admin-token') || req.nextUrl.searchParams.get('token');
    if (token === (process.env.SWARM_ADMIN_TOKEN || 'swarm-admin-dev')) {
      if (!isLocalRequest(req)) return NextResponse.json({ error: 'Admin token only accepted from localhost' }, { status: 403 });
      const { ensureDefaultUser } = await import('./schema');
      return handler(req, await ensureDefaultUser());
    }
    // JWT auth allowed remotely (admin role required)
    const jwt = req.headers.get('authorization')?.replace('Bearer ', '');
    if (jwt) {
      const payload = await verifyJwt(jwt);
      if (payload?.userId && payload.role === 'admin') return handler(req, payload.userId);
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  };
}

export function withUser(handler: (req: NextRequest, userId: string, role: string) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const jwt = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyJwt(jwt);
    if (!payload?.userId) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    return handler(req, payload.userId, payload.role || 'user');
  };
}

export { initSchema } from './schema';

export function withAuthOrAdmin(handler: (req: NextRequest, agent: { id: string; userId: string; permissions: string }) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // Try agent API key first
    const key = req.headers.get('authorization')?.replace('Bearer ', '');
    if (key) {
      const agent = await getAgentByKey(key);
      if (agent) return handler(req, agent);
      const user = await getUserByToken(key);
      if (user) return handler(req, { id: 'user:' + user.id, userId: user.userId, permissions: 'read,write' });
      const payload = await verifyJwt(key);
      if (payload?.userId) return handler(req, { id: 'admin', userId: payload.userId, permissions: 'read,write' });
    }
    // Try admin token (localhost only)
    const token = req.headers.get('x-admin-token') || req.nextUrl.searchParams.get('token');
    if (token === (process.env.SWARM_ADMIN_TOKEN || 'swarm-admin-dev') && isLocalRequest(req)) {
      const { ensureDefaultUser } = await import('./schema');
      const userId = await ensureDefaultUser();
      return handler(req, { id: 'admin', userId, permissions: 'read,write' });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  };
}
