// src/common/middleware/withRequestLogging.ts
import { NextRequest, NextResponse } from 'next/server';
import { logRequest } from './request-logger.middleware';
import { getSession } from '@/lib/auth';

type ApiHandler = (request: NextRequest) => Promise<NextResponse>;

export function withRequestLogging(handler: ApiHandler, endpointName: string): ApiHandler {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    
    // Get user ID if authenticated
    let userId: number | undefined;
    try {
      const session = await getSession();
      userId = session?.userId;
    } catch {
      // Not authenticated - that's fine
    }
    
    try {
      const response = await handler(request);
      await logRequest(request, response, startTime, userId);
      return response;
    } catch (error) {
      // Create error response
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      await logRequest(request, errorResponse, startTime, userId);
      throw error;
    }
  };
}