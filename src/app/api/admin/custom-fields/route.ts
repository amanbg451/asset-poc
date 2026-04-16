// src/app/api/admin/custom-fields/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET all custom fields
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const fields = await prisma.customField.findMany({
      orderBy: { display_order: 'asc' }
    });
    
    return NextResponse.json({ success: true, fields });
  } catch (error) {
    console.error('GET custom fields error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// CREATE custom field
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { field_label, field_type, field_options, section, is_required } = body;
    
    // Generate field_key from label (lowercase, spaces to underscores)
    const field_key = field_label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    // Get max display_order
    const maxOrder = await prisma.customField.aggregate({
      _max: { display_order: true }
    });
    
    const field = await prisma.customField.create({
      data: {
        field_key,
        field_label,
        field_type,
        field_options: field_options || null,
        section: section || 'General',
        is_required: is_required || false,
        display_order: (maxOrder._max.display_order || 0) + 1,
      }
    });
    
    return NextResponse.json({ success: true, field }, { status: 201 });
  } catch (error) {
    console.error('POST custom field error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// UPDATE custom field
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, field_label, field_type, field_options, section, is_required, is_active } = body;
    
    const field = await prisma.customField.update({
      where: { id: parseInt(id.toString()) },
      data: {
        field_label,
        field_type,
        field_options: field_options || null,
        section,
        is_required,
        is_active,
      }
    });
    
    return NextResponse.json({ success: true, field });
  } catch (error) {
    console.error('PUT custom field error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE custom field
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Field ID required' }, { status: 400 });
    }
    
    // Get field key first
    const field = await prisma.customField.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (field) {
      // Delete all values for this field
      await prisma.customFieldValue.deleteMany({
        where: { field_key: field.field_key }
      });
    }
    
    await prisma.customField.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE custom field error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}