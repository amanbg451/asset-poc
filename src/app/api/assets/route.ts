import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: { created_at: 'desc' },
    });
    
    return NextResponse.json({ assets });
  } catch (error) {
    console.error('GET assets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { asset_code, asset_name, category, status, purchase_date, purchase_amount, description } = body;
    
    const asset = await prisma.asset.create({
      data: {
        asset_code,
        asset_name,
        category,
        status: status || 'Active',
        purchase_date: purchase_date ? new Date(purchase_date) : null,
        purchase_amount: purchase_amount ? parseFloat(purchase_amount) : null,
        description,
      },
    });
    
    return NextResponse.json({ success: true, asset });
  } catch (error) {
    console.error('POST asset error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}