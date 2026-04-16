import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/modules/auth/auth.service';
import { rateLimit } from '@/common/middleware/rate-limit.middleware';
import { withRequestLogging } from '@/common/middleware/withRequestLogging';
import { env } from '@/config';

const authService = new AuthService();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'Too many refresh attempts. Please try again later.',
});

const refreshHandler = async (request: NextRequest) => {
  const rateLimitResponse = await limiter(request);
  if (rateLimitResponse) return rateLimitResponse;
  
  const { refreshToken } = await request.json();
  
  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
  }
  
  const result = await authService.refreshAccessToken(refreshToken);
  
  if (!result) {
    return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
  }
  
  const response = NextResponse.json({ success: true });
  response.cookies.set('token', result.accessToken, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  
  return response;
};

export const POST = withRequestLogging(refreshHandler, 'POST /api/auth/refresh');