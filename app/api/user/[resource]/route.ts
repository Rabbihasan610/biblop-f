import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { upstreamFetch } from '@/lib/upstream-fetch';

const backend = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const routes: Record<string, { path: string; methods: string[] }> = {
  dashboard: { path: '/api/user/dashboard', methods: ['GET'] },
  transactions: { path: '/api/transactions', methods: ['GET'] },
  deposits: { path: '/api/deposit/history', methods: ['GET'] },
  withdrawals: { path: '/api/withdraw/history', methods: ['GET'] },
  'game-logs': { path: '/api/user/game/log', methods: ['GET'] },
  'deposit-methods': { path: '/api/deposit/methods', methods: ['GET'] },
  'withdraw-methods': { path: '/api/withdraw-method', methods: ['GET'] },
  deposit: { path: '/api/deposit/insert', methods: ['POST'] },
  withdraw: { path: '/api/withdraw-request', methods: ['POST'] },
  'withdraw-confirm': { path: '/api/withdraw-request/confirm', methods: ['POST'] },
  password: { path: '/api/change-password', methods: ['POST'] },
  profile: { path: '/api/user/profile', methods: ['GET'] },
  'profile-save': { path: '/api/profile-setting', methods: ['POST'] },
  tickets: { path: '/api/ticket', methods: ['GET'] },
  'ticket-create': { path: '/api/ticket/create', methods: ['POST'] },
};

async function proxy(request: NextRequest, resource: string) {
  const route = routes[resource];
  if (!route || !route.methods.includes(request.method)) return NextResponse.json({ status: 'error', message: 'Not found' }, { status: 404 });
  const token = (await cookies()).get('jubo88_token')?.value;
  if (!token) return NextResponse.json({ status: 'error', message: 'Your session has ended. Please sign in again.' }, { status: 401 });
  try {
    const multipart = request.method !== 'GET' && request.headers.get('content-type')?.startsWith('multipart/form-data');
    const headers: Record<string, string> = { Accept: 'application/json', Authorization: `Bearer ${token}` };
    if (!multipart) headers['Content-Type'] = 'application/json';
    const response = await upstreamFetch(`${backend}${route.path}${request.method === 'GET' ? request.nextUrl.search : ''}`, {
      method: request.method,
      headers,
      body: request.method === 'GET' ? undefined : multipart ? await request.formData() : JSON.stringify(await request.json()),
      cache: 'no-store',
    }, request.method === 'GET');
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ status: 'error', message: 'The account service is temporarily unavailable.' }, { status: 502 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ resource: string }> }) { return proxy(request, (await context.params).resource); }
export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) { return proxy(request, (await context.params).resource); }
