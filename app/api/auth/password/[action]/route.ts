import { NextRequest, NextResponse } from 'next/server';
import { upstreamFetch } from '@/lib/upstream-fetch';

const backend = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const paths: Record<string, string> = { email: 'email', verify: 'verify-code', reset: 'reset' };

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!paths[action]) return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 });
  try {
    const upstream = await upstreamFetch(`${backend}/api/password/${paths[action]}`, {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(await request.json()), cache: 'no-store',
    });
    return NextResponse.json(await upstream.json(), { status: upstream.status });
  } catch {
    return NextResponse.json({ status: 'error', message: 'Password recovery is temporarily unavailable.' }, { status: 502 });
  }
}
