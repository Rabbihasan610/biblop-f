import { NextRequest, NextResponse } from 'next/server';
import { upstreamFetch } from '@/lib/upstream-fetch';

const backend = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const payloadBody = contentType.includes('application/json')
      ? await request.json().catch(() => ({}))
      : Object.fromEntries((await request.formData()).entries());

    const response = await upstreamFetch(`${backend}/api/register`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(contentType.includes('multipart/form-data') ? {} : { 'Content-Type': 'application/json' }),
      },
      body: contentType.includes('multipart/form-data') ? (() => {
        const form = new FormData();
        Object.entries(payloadBody as Record<string, unknown>).forEach(([key, value]) => {
          if (value !== undefined && value !== null) form.append(key, String(value));
        });
        return form;
      })() : JSON.stringify(payloadBody),
      cache: 'no-store',
    });
    const payload = await response.json();
    const outgoing = NextResponse.json(payload, { status: response.status });
    const token = payload?.data?.access_token ?? payload?.data?.token;
    if (response.ok && typeof token === 'string') outgoing.cookies.set('jaba9_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return outgoing;
  } catch {
    return NextResponse.json({ status: 'error', message: 'Registration is temporarily unavailable.' }, { status: 502 });
  }
}
