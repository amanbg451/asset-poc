// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CategoryController } from '@/modules/category/category.controller';

export async function GET() {
  try {
    return await CategoryController.getAll();
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await CategoryController.create(request);
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}