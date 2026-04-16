// src/common/middleware/rate-limit.middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting for development
// (For production, use Redis with @upstash/ratelimit)

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

export function rateLimit(config: RateLimitConfig) {
  return async function (request: NextRequest): Promise<NextResponse | null> {
    // Get client identifier (IP address or API key)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'anonymous';
    
    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);
    
    // If no record exists, create one
    if (!record) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return null; // Allow the request
    }
    
    // If window has expired, reset
    if (now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return null; // Allow the request
    }
    
    // If within window, check count
    if (record.count >= config.maxRequests) {
      const waitTime = Math.ceil((record.resetTime - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: config.message || `Too many requests. Please try again in ${waitTime} seconds.`,
          retryAfter: waitTime,
        },
        { 
          status: 429, // Too Many Requests
          headers: {
            'Retry-After': waitTime.toString(),
          },
        }
      );
    }
    
    // Increment count
    record.count++;
    rateLimitStore.set(key, record);
    
    return null; // Allow the request
  };
}

// Clean up old records every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);