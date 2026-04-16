// src/modules/department/department.controller.ts
import { NextRequest, NextResponse } from 'next/server';
import { DepartmentService } from './department.service';
import { getSession } from '@/lib/auth';

const departmentService = new DepartmentService();

export class DepartmentController {
  static async getAll() {
    const departments = await departmentService.getAllDepartments();
    return NextResponse.json({ success: true, departments });
  }

  static async getById(id: number) {
    const department = await departmentService.getDepartmentById(id);
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, department });
  }

  static async create(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const department = await departmentService.createDepartment({
      name: body.name,
      code: body.code,
      description: body.description
    });
    return NextResponse.json({ success: true, department }, { status: 201 });
  }

  static async update(request: NextRequest, id: number) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const department = await departmentService.updateDepartment(id, {
      name: body.name,
      code: body.code,
      description: body.description
    });
    return NextResponse.json({ success: true, department });
  }

  static async delete(id: number) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await departmentService.deleteDepartment(id);
    return NextResponse.json({ success: true });
  }
}