// src/app/api/assets/[id]/assign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logger } from '@/common/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const assetId = parseInt(id);
    const { userId, assigned_date, expected_return, notes } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Check if asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });
    
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update asset with assignment
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        assigned_to: userId,
        assigned_date: assigned_date ? new Date(assigned_date) : new Date(),
        expected_return: expected_return ? new Date(expected_return) : null,
        assigned_notes: notes,
        status: 'Active',
      },
      include: {
        assignedUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    logger.info('Asset assigned', { 
      assetId, 
      assetCode: asset.asset_code,
      userId, 
      assignedBy: session.userId 
    });
    
    return NextResponse.json({ success: true, asset: updatedAsset });
  } catch (error) {
    console.error('Assign asset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}