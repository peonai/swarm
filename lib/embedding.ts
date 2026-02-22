/* embedding.ts — OpenAI-compatible embedding API, graceful fallback */
import db from './db';
import { initSchema } from './schema';

async function getConfig(userId?: string) {
  await initSchema();
  const get = async (uid: string, key: string) =>
    await db.prepare('SELECT value FROM user_settings WHERE user_id = ? AND key = ?').get(uid, key) as any;

  const resolve = async (key: string, envKey: string) => {
    if (userId) { const r = await get(userId, key); if (r?.value) return r.value; }
    const g = await get('__global__', key); if (g?.value) return g.value;
    return process.env[envKey] || '';
  };

  const url = await resolve('embed_url', 'EMBED_URL');
  const key = await resolve('embed_key', 'EMBED_KEY');
  const model = (await resolve('embed_model', 'EMBED_MODEL')) || 'text-embedding-3-small';
  return { url, key, model, enabled: !!(url && key) };
}

export async function embed(text: string, userId?: string): Promise<number[]> {
  const cfg = await getConfig(userId);
  if (!cfg.enabled) return [];
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify({ model: cfg.model, input: text }),
  });
  if (!res.ok) throw new Error(`Embedding API ${res.status}`);
  const data = await res.json();
  return data.data[0].embedding;
}

export function cosine(a: number[], b: number[]): number {
  if (!a.length || !b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export { getConfig as getEmbeddingConfig };
