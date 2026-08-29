import { NextRequest, NextResponse } from 'next/server';
import { upstreamFetch } from '@/lib/upstream-fetch';

const backend = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function POST(request: NextRequest) {
  try {
    const response = await upstreamFetch(`${backend}/api/login`, {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(await request.json()), cache: 'no-store',
    });
    const payload = await response.json();
    const outgoing = NextResponse.json(payload, { status: response.status });
    const token = payload?.data?.access_token ?? payload?.data?.token;
    if (response.ok && typeof token === 'string') outgoing.cookies.set('jaba9_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return outgoing;
  } catch {
    return NextResponse.json({ status: 'error', message: 'Sign in is temporarily unavailable.' }, { status: 502 });
  }
}
