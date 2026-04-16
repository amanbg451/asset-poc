// src/modules/category/category.service.ts
import prisma from '@/lib/prisma';

export class CategoryService {
  async getAllCategories() {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return categories;
  }

  async getCategoryById(id: number) {
    return await prisma.category.findUnique({
      where: { id }
    });
  }

  async createCategory(data: { name: string; code?: string; description?: string; icon?: string }) {
    // Check for duplicate name
    const existing = await prisma.category.findFirst({
      where: { name: data.name }
    });
    
    if (existing) {
      throw new Error('Category already exists');
    }
    
    // Check for duplicate code if provided
    if (data.code) {
      const existingCode = await prisma.category.findFirst({
        where: { code: data.code }
      });
      if (existingCode) {
        throw new Error('Category code already exists');
      }
    }
    
    return await prisma.category.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        icon: data.icon
      }
    });
  }

  async updateCategory(id: number, data: { name: string; code?: string; description?: string; icon?: string }) {
    // Check for duplicate name
    const existing = await prisma.category.findFirst({
      where: {
        name: data.name,
        id: { not: id }
      }
    });
    
    if (existing) {
      throw new Error('Category already exists');
    }
    
    // Check for duplicate code if provided
    if (data.code) {
      const existingCode = await prisma.category.findFirst({
        where: {
          code: data.code,
          id: { not: id }
        }
      });
      if (existingCode) {
        throw new Error('Category code already exists');
      }
    }
    
    return await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        icon: data.icon
      }
    });
  }

  async deleteCategory(id: number) {
    // Check if category has assets
    const assetCount = await prisma.asset.count({
      where: { category_id: id }
    });
    
    if (assetCount > 0) {
      throw new Error(`Cannot delete category with ${assetCount} assets. Reassign assets first.`);
    }
    
    return await prisma.category.delete({ where: { id } });
  }
}