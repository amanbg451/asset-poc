// src/common/middleware/request-logger.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/common/utils';

export interface RequestLogDetails {
  method: string;
  url: string;
  status: number;
  duration: number;
  userId?: number;
  ip: string;
  userAgent: string;
  responseSize?: number;
}

export async function logRequest(
  request: NextRequest,
  response: NextResponse,
  startTime: number,
  userId?: number
) {
  const duration = Date.now() - startTime;
  
  const logDetails: RequestLogDetails = {
    method: request.method,
    url: request.nextUrl.pathname,
    status: response.status,
    duration,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
  
  if (userId) {
    logDetails.userId = userId;
  }
  
  // Get response size if available
  const responseBody = response.body;
  if (responseBody) {
    // Approximate size
    logDetails.responseSize = JSON.stringify(responseBody).length;
  }
  
  // Log based on status code
  if (response.status >= 500) {
    logger.error(`❌ ${request.method} ${request.nextUrl.pathname}`, logDetails);
  } else if (response.status >= 400) {
    logger.warn(`⚠️ ${request.method} ${request.nextUrl.pathname}`, logDetails);
  } else {
    logger.info(`✅ ${request.method} ${request.nextUrl.pathname}`, logDetails);
  }
  
  return response;
}