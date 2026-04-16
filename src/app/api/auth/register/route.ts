import { NextRequest } from 'next/server';
import { AuthController } from '@/modules/auth/auth.controller';
import { rateLimit } from '@/common/middleware/rate-limit.middleware';

// Rate limit: 3 registration attempts per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: 'Too many registration attempts. Please try again in an hour.',
});

export async function POST(request: NextRequest) {
  // Check rate limit first
  const rateLimitResponse = await limiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  return AuthController.register(request);
}