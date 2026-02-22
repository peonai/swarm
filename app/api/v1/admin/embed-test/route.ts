export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { withUser } from '@/lib/auth';
import { getEmbeddingConfig, embed } from '@/lib/embedding';

export const GET = withUser(async (_req, userId, role) => {
  const cfg = await getEmbeddingConfig(userId);
  let testResult: any = null;
  try {
    const vec = await embed('test', userId);
    testResult = { ok: true, dimensions: vec.length };
  } catch (e: any) {
    testResult = { ok: false, error: e.message };
  }
  return NextResponse.json({
    debug: { userId, role },
    config: { url: cfg.url, model: cfg.model, enabled: cfg.enabled, hasKey: !!cfg.key },
    test: testResult,
  });
});
