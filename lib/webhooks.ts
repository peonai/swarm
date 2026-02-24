import db from './db';
import { initSchema } from './schema';
import { createHmac } from 'crypto';

export type WebhookEvent = 'profile.updated' | 'memory.created' | 'profile.observed';

interface Webhook { id: number; url: string; events: string; secret: string | null }

export async function fireWebhooks(userId: string, event: WebhookEvent, payload: Record<string, unknown>) {
  await initSchema();
  const hooks = await db.prepare(
    "SELECT id, url, events, secret FROM webhooks WHERE user_id = ? AND active = 1"
  ).all(userId) as Webhook[];

  const body = JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload });

  for (const hook of hooks) {
    if (hook.events !== '*' && !hook.events.split(',').includes(event)) continue;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (hook.secret) headers['X-Swarm-Signature'] = createHmac('sha256', hook.secret).update(body).digest('hex');
    fetch(hook.url, { method: 'POST', headers, body, signal: AbortSignal.timeout(10000) }).catch(() => {});
  }
}
