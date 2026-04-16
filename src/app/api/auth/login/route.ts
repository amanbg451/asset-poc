import { NextRequest } from 'next/server';
import { AuthController } from '@/modules/auth/auth.controller';
import { rateLimit } from '@/common/middleware/rate-limit.middleware';
import { withRequestLogging } from '@/common/middleware/withRequestLogging';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'Too many login attempts. Please try again in a minute.',
});

const loginHandler = async (request: NextRequest) => {
  const rateLimitResponse = await limiter(request);
  if (rateLimitResponse) return rateLimitResponse;
  
  return AuthController.login(request);
};

export const POST = withRequestLogging(loginHandler, 'POST /api/auth/login');