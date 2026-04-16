import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/common/middleware/rate-limit.middleware';
import { logger } from '@/common/utils';
import { getSession } from '@/lib/auth';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: 'Too many requests. Please slow down.',
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;
    
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const assetId = parseInt(id);
    
    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }
    
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });
    
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, asset });
  } catch (error) {
    logger.error('GET asset error:', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;
    
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const assetId = parseInt(id);
    
    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }
    
    const body = await request.json();
    const { asset_name, category, status, purchase_date, purchase_amount, description } = body;
    
    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id: assetId },
    });
    
    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    logger.info('Updating asset', { assetId, userId: session.userId });
    
    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        asset_name: asset_name || existingAsset.asset_name,
        category: category !== undefined ? category : existingAsset.category,
        status: status || existingAsset.status,
        purchase_date: purchase_date ? new Date(purchase_date) : existingAsset.purchase_date,
        purchase_amount: purchase_amount ? parseFloat(purchase_amount) : existingAsset.purchase_amount,
        description: description !== undefined ? description : existingAsset.description,
      },
    });
    
    return NextResponse.json({ success: true, asset });
  } catch (error) {
    logger.error('PUT asset error:', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;
    
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const assetId = parseInt(id);
    
    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }
    
    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id: assetId },
    });
    
    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    logger.info('Deleting asset', { assetId, assetCode: existingAsset.asset_code, userId: session.userId });
    
    await prisma.asset.delete({
      where: { id: assetId },
    });
    
    return NextResponse.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    logger.error('DELETE asset error:', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}