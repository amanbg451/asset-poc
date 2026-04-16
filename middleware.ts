// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityHeaders } from '@/common/middleware/security.middleware';

export function middleware(request: NextRequest) {
  // Apply security headers to all responses
  const response = securityHeaders(request);
  
  // Your existing auth logic can go here
  const token = request.cookies.get('token')?.value;
  const isAuthenticated = !!token;
  const path = request.nextUrl.pathname;

  // Protected routes logic
  if (path === '/dashboard' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (path === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};