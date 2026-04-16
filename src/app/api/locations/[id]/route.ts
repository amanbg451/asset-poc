// src/app/api/locations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LocationController } from '@/modules/location/location.controller';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await LocationController.getById(parseInt(id));
  } catch (error) {
    console.error('GET /api/locations/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await LocationController.update(request, parseInt(id));
  } catch (error) {
    console.error('PUT /api/locations/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await LocationController.delete(parseInt(id));
  } catch (error) {
    console.error('DELETE /api/locations/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}