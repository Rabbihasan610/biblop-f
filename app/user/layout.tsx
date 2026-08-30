import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { upstreamFetch } from '@/lib/upstream-fetch';

const backend = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

export default async function UserLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get('jaba9_token')?.value;

  if (!token) redirect('/?auth=login');

  let authenticated = false;
  try {
    const response = await upstreamFetch(`${backend}/api/user/dashboard`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    authenticated = response.ok;
  } catch {
    authenticated = false;
  }

  if (!authenticated) redirect('/?auth=login');

  return children;
}
