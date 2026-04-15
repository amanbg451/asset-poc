// src/common/utils/api-response.ts
import { NextResponse } from 'next/server';

export class ApiResponse {
  static success<T>(data: T, status: number = 200) {
    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  static error(message: string, status: number = 500, details?: any) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        details,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  static created<T>(data: T) {
    return this.success(data, 201);
  }

  static badRequest(message: string) {
    return this.error(message, 400);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return this.error(message, 403);
  }

  static notFound(message: string = 'Not found') {
    return this.error(message, 404);
  }
}