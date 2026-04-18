// src/app/api/assets/[id]/delete-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AuditService } from '@/modules/audit/audit.service';

const auditService = new AuditService();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const assetId = parseInt(id);

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    if (asset.videos) {
      // Delete video file from disk
      const filePath = path.join(process.cwd(), 'public', asset.videos);
      await unlink(filePath).catch(() => {});

      // Update asset
      await prisma.asset.update({
        where: { id: assetId },
        data: { videos: null },
      });

      // Add audit log for video delete
      await auditService.log(
        assetId,
        'VIDEO_DELETE',
        {
          fieldName: 'videos',
          oldValue: asset.videos,
          newValue: null,
          additionalDetails: { 
            deletedVideoUrl: asset.videos
          }
        },
        request
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete video error:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}