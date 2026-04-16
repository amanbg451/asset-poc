// src/modules/category/category.controller.ts
import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from './category.service';
import { getSession } from '@/lib/auth';

const categoryService = new CategoryService();

export class CategoryController {
  static async getAll() {
    const categories = await categoryService.getAllCategories();
    return NextResponse.json({ success: true, categories });
  }

  static async getById(id: number) {
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, category });
  }

  static async create(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const category = await categoryService.createCategory({
      name: body.name,
      code: body.code,
      description: body.description,
      icon: body.icon
    });
    return NextResponse.json({ success: true, category }, { status: 201 });
  }

  static async update(request: NextRequest, id: number) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const category = await categoryService.updateCategory(id, {
      name: body.name,
      code: body.code,
      description: body.description,
      icon: body.icon
    });
    return NextResponse.json({ success: true, category });
  }

  static async delete(id: number) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await categoryService.deleteCategory(id);
    return NextResponse.json({ success: true });
  }
}