// src/app/api/departments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DepartmentController } from '@/modules/department/department.controller';

export async function GET() {
  try {
    return await DepartmentController.getAll();
  } catch (error) {
    console.error('GET /api/departments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await DepartmentController.create(request);
  } catch (error) {
    console.error('POST /api/departments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}