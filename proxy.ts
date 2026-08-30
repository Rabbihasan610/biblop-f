import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.cookies.has('jaba9_token')) return NextResponse.next();

  const loginUrl = new URL('/', request.url);
  loginUrl.searchParams.set('auth', 'login');
  loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard/:path*', '/user/:path*'],
};
