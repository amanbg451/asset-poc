// src/app/api/assets/[id]/upload-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AuditService } from '@/modules/audit/audit.service';

const auditService = new AuditService();

export async function POST(
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

    const formData = await request.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json({ error: 'No video file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only MP4, MOV, WEBM allowed.' }, { status: 400 });
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 50MB.' }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `video-asset-${assetId}-${timestamp}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads/assets/videos');
    const filePath = path.join(uploadDir, filename);
    const publicUrl = `/uploads/assets/videos/${filename}`;

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update asset with video URL
    await prisma.asset.update({
      where: { id: assetId },
      data: { videos: publicUrl },
    });

    // Add audit log for video upload
    await auditService.log(
      assetId,
      'VIDEO_ADD',
      {
        fieldName: 'videos',
        newValue: publicUrl,
        additionalDetails: { 
          videoUrl: publicUrl,
          fileName: filename
        }
      },
      request
    );

    return NextResponse.json({
      success: true,
      videoUrl: publicUrl,
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
  }
}