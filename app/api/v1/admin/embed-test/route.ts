export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { withUser } from '@/lib/auth';
import { getEmbeddingConfig, embed } from '@/lib/embedding';

export const GET = withUser(async (_req, userId, role) => {
  if (role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  const cfg = await getEmbeddingConfig();
  let testResult: any = null;
  try {
    const vec = await embed('test');
    testResult = { ok: true, dimensions: vec.length };
  } catch (e: any) {
    testResult = { ok: false, error: e.message };
  }
  return NextResponse.json({
    config: { url: cfg.url, model: cfg.model, enabled: cfg.enabled, hasKey: !!cfg.key },
    test: testResult,
  });
});
