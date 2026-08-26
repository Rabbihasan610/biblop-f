import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { upstreamFetch } from '@/lib/upstream-fetch';

const backend = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const routes: Record<string, { path: string; methods: string[]; public?: boolean }> = {
  login: { path: '/api/affiliate/login', methods: ['POST'], public: true }, register: { path: '/api/affiliate/register', methods: ['POST'], public: true },
  dashboard: { path: '/api/affiliate/dashboard', methods: ['GET'] }, users: { path: '/api/affiliate/users', methods: ['GET'] },
  deposits: { path: '/api/affiliate/deposits', methods: ['GET'] }, earnings: { path: '/api/affiliate/earnings', methods: ['GET'] },
  withdrawals: { path: '/api/affiliate/withdrawals', methods: ['GET'] }, transfer: { path: '/api/affiliate/transfer', methods: ['POST'] },
  withdraw: { path: '/api/affiliate/withdraw', methods: ['POST'] }, logout: { path: '/api/affiliate/logout', methods: ['POST'] },
};

async function proxy(request: NextRequest, resource: string) {
  const route = routes[resource];
  if (!route || !route.methods.includes(request.method)) return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 });
  const store = await cookies(), token = store.get('jubo88_affiliate_token')?.value;
  if (!route.public && !token) return NextResponse.json({ status: 'error', message: 'Your affiliate session has ended. Please sign in again.' }, { status: 401 });
  try {
    const response = await upstreamFetch(`${backend}${route.path}${request.method === 'GET' ? request.nextUrl.search : ''}`, {
      method: request.method, headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: request.method === 'GET' ? undefined : JSON.stringify(await request.json()), cache: 'no-store',
    }, request.method === 'GET');
    let payload: unknown;
    try { payload = await response.json(); } catch { return NextResponse.json({ status: 'error', message: 'The affiliate service returned an invalid response.' }, { status: 502 }); }
    const outgoing = NextResponse.json(payload, { status: response.status });
    const accessToken = (payload as { data?: { access_token?: unknown } })?.data?.access_token;
    if (resource === 'login' && response.ok && typeof accessToken === 'string') outgoing.cookies.set('jubo88_affiliate_token', accessToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/affiliate', maxAge: 60 * 60 * 24 * 7 });
    if (resource === 'logout') outgoing.cookies.delete('jubo88_affiliate_token');
    return outgoing;
  } catch { return NextResponse.json({ status: 'error', message: 'The affiliate service is temporarily unavailable.' }, { status: 502 }); }
}
export async function GET(request: NextRequest, context: { params: Promise<{ resource: string }> }) { return proxy(request, (await context.params).resource); }
export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) { return proxy(request, (await context.params).resource); }
