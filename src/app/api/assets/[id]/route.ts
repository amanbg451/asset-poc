import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('GET - ID:', id);
    
    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    return NextResponse.json({ asset });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('=== PUT START ===');
    console.log('Asset ID:', id);
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { asset_name, category, status, purchase_date, purchase_amount, description } = body;
    
    const asset = await prisma.asset.update({
      where: { id: parseInt(id) },
      data: {
        asset_name,
        category,
        status,
        purchase_date: purchase_date ? new Date(purchase_date) : null,
        purchase_amount: purchase_amount ? parseFloat(purchase_amount) : null,
        description,
      },
    });
    
    console.log('Update successful!');
    return NextResponse.json({ success: true, asset });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('DELETE - ID:', id);
    
    await prisma.asset.delete({
      where: { id: parseInt(id) },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}