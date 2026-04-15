// src/common/middleware/error.middleware.ts
import { NextResponse } from 'next/server';
import { AppError } from '../errors';
import { logger } from '../utils';

export function handleError(error: unknown) {
  // Handle known AppErrors
  if (error instanceof AppError) {
    logger.warn(`AppError: ${error.message}`, { statusCode: error.statusCode, code: error.code });
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    const zodError = error as any;
    const errors = zodError.issues?.map((issue: any) => issue.message).join(', ') || 'Validation failed';
    
    return NextResponse.json(
      {
        success: false,
        error: errors,
        timestamp: new Date().toISOString(),
      },
      { status: 422 }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'A record with this value already exists',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }
    
    // Record not found
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Record not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }
  }

  // Handle unknown errors
  logger.error('Unhandled error', { error });
  
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}