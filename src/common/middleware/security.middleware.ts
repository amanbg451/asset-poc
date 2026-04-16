// src/common/middleware/security.middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function securityHeaders(request: NextRequest) {
  const response = NextResponse.next();
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking (can't embed in iframe)
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Restrict which domains can load resources
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
    ].join('; ')
  );
  
  // Tell browser to always use HTTPS (for production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Prevent search engines from indexing (for development)
  if (process.env.NODE_ENV !== 'production') {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  
  return response;
}