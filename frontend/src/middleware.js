import { NextResponse } from 'next/server';

/**
 * Middleware handles scroll-to-top and passes through all requests.
 * Auth protection is handled at the layout level via RoleProtectedRoute.
 */
export function middleware(request) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
