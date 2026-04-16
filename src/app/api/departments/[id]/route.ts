// src/app/api/departments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DepartmentController } from '@/modules/department/department.controller';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await DepartmentController.getById(parseInt(id));
  } catch (error) {
    console.error('GET /api/departments/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await DepartmentController.update(request, parseInt(id));
  } catch (error) {
    console.error('PUT /api/departments/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await DepartmentController.delete(parseInt(id));
  } catch (error) {
    console.error('DELETE /api/departments/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}