import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { upstreamFetch } from '@/lib/upstream-fetch';

const backend = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function POST() {
  const store = await cookies();
  const token = store.get('jaba9_token')?.value;
  try {
    if (token) {
      await upstreamFetch(`${backend}/api/logout`, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, cache: 'no-store' });
    }
  } catch {
    // Local cookie removal still signs the browser out when Laravel is temporarily unavailable.
  }
  store.delete('jaba9_token');
  return NextResponse.json({ status: 'success', message: 'Signed out successfully.' });
}
