import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Define paths that require authentication
  const authRequired = [
    '/dashboard',
    '/settings',
    '/financial-profile',
  ];

  // Check if the path requires authentication
  const pathname = request.nextUrl.pathname;
  const requiresAuth = authRequired.some(path => pathname.startsWith(path));

  // If unauthenticated and trying to access protected route, redirect to login
  if (!session && requiresAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/signin';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access login, redirect to dashboard
  if (session && pathname === '/auth/signin') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
