// src/modules/department/department.service.ts
import prisma from '@/lib/prisma';

export class DepartmentService {
  async getAllDepartments() {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    return departments;
  }

  async getDepartmentById(id: number) {
    return await prisma.department.findUnique({
      where: { id }
    });
  }

  async createDepartment(data: { name: string; code?: string; description?: string }) {
    // Check for duplicate name
    const existing = await prisma.department.findFirst({
      where: {
        name: data.name
      }
    });
    
    if (existing) {
      throw new Error('Department already exists');
    }
    
    // Check for duplicate code if provided
    if (data.code) {
      const existingCode = await prisma.department.findFirst({
        where: { code: data.code }
      });
      if (existingCode) {
        throw new Error('Department code already exists');
      }
    }
    
    return await prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description
      }
    });
  }

  async updateDepartment(id: number, data: { name: string; code?: string; description?: string }) {
    // Check for duplicate name
    const existing = await prisma.department.findFirst({
      where: {
        name: data.name,
        id: { not: id }
      }
    });
    
    if (existing) {
      throw new Error('Department already exists');
    }
    
    // Check for duplicate code if provided
    if (data.code) {
      const existingCode = await prisma.department.findFirst({
        where: {
          code: data.code,
          id: { not: id }
        }
      });
      if (existingCode) {
        throw new Error('Department code already exists');
      }
    }
    
    return await prisma.department.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description
      }
    });
  }

  async deleteDepartment(id: number) {
    // Check if department has assets
    const assetCount = await prisma.asset.count({
      where: { department_id: id }
    });
    
    if (assetCount > 0) {
      throw new Error(`Cannot delete department with ${assetCount} assets. Reassign assets first.`);
    }
    
    return await prisma.department.delete({ where: { id } });
  }
}