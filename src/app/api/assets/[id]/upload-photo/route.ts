// src/app/api/assets/[id]/upload-photo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const file = formData.get('photo') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WEBP allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    // Create unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `asset-${assetId}-${timestamp}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads/assets');
    const filePath = path.join(uploadDir, filename);
    const publicUrl = `/uploads/assets/${filename}`;

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Get existing photos
    const existingPhotos = asset.photos ? JSON.parse(asset.photos) : [];
    
    // Add new photo
    const newPhotos = [...existingPhotos, publicUrl];
    
    // Update asset with new photos list
    await prisma.asset.update({
      where: { id: assetId },
      data: { photos: JSON.stringify(newPhotos) },
    });

    return NextResponse.json({
      success: true,
      photoUrl: publicUrl,
      photos: newPhotos,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}