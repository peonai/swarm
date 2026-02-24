import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const spec = readFileSync(join(process.cwd(), 'docs', 'openapi.yaml'), 'utf8');
    return new NextResponse(spec, { headers: { 'Content-Type': 'text/yaml' } });
  } catch {
    return NextResponse.json({ error: 'OpenAPI spec not found' }, { status: 404 });
  }
}
