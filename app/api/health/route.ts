import { NextResponse } from 'next/server';
export function GET() { return NextResponse.json({ ok: true, version: '0.5.2' }); }
