// src/app/api/locations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LocationController } from '@/modules/location/location.controller';

export async function GET() {
  try {
    return await LocationController.getAll();
  } catch (error) {
    console.error('GET /api/locations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await LocationController.create(request);
  } catch (error) {
    console.error('POST /api/locations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}