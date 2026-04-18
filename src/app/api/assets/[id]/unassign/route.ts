// src/app/api/assets/[id]/unassign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { logger } from '@/common/utils';
import { AuditService } from '@/modules/audit/audit.service';

const auditService = new AuditService();

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
    
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        assignedUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        assigned_to: null,
        assigned_date: null,
        expected_return: null,
        assigned_notes: null,
      }
    });
    
    // Add audit log for unassign
    await auditService.log(
      assetId,
      'UNASSIGN',
      {
        fieldName: 'assigned_to',
        oldValue: asset.assigned_to,
        newValue: null,
        additionalDetails: {
          previousUser: asset.assignedUser?.name,
          previousUserEmail: asset.assignedUser?.email
        }
      },
      request
    );
    
    logger.info('Asset unassigned', { 
      assetId, 
      assetCode: asset.asset_code,
      unassignedBy: session.userId 
    });
    
    return NextResponse.json({ success: true, asset: updatedAsset });
  } catch (error) {
    console.error('Unassign asset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}