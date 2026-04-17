// src/app/api/assets/[id]/delete-photo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const { searchParams } = new URL(request.url);
    const photoUrl = searchParams.get('url');

    if (!photoUrl) {
      return NextResponse.json({ error: 'Photo URL required' }, { status: 400 });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const existingPhotos = asset.photos ? JSON.parse(asset.photos) : [];
    const updatedPhotos = existingPhotos.filter((p: string) => p !== photoUrl);

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'public', photoUrl);
    await unlink(filePath).catch(() => {}); // Ignore if file doesn't exist

    await prisma.asset.update({
      where: { id: assetId },
      data: { photos: JSON.stringify(updatedPhotos) },
    });

    return NextResponse.json({ success: true, photos: updatedPhotos });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}