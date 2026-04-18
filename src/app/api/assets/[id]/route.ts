import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/common/middleware/rate-limit.middleware';
import { logger } from '@/common/utils';
import { getSession } from '@/lib/auth';
import { AuditService } from '@/modules/audit/audit.service';

const auditService = new AuditService();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: 'Too many requests. Please slow down.',
});

// Helper functions for type conversion
const toInt = (value: any) => {
  if (value === undefined || value === null || value === '') return null;
  const num = parseInt(value);
  return isNaN(num) ? null : num;
};

const toFloat = (value: any) => {
  if (value === undefined || value === null || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

const toDate = (value: any) => {
  if (value === undefined || value === null || value === '') return null;
  return new Date(value);
};

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
      include: {
        category: true,
        department: true,
        location: true,
        assignedUser: {
          select: { id: true, name: true, email: true }
        }
      }
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
    
    // Get old asset values BEFORE update
    const oldAsset = await prisma.asset.findUnique({
      where: { id: assetId },
    });
    
    if (!oldAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    
    logger.info('Updating asset', { assetId, userId: session.userId });
    
    const asset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        // Basic Info
        asset_code: body.asset_code,
        asset_name: body.asset_name,
        
        // Asset Details
        installation_date: toDate(body.installation_date),
        tagged_status: body.tagged_status,
        commissioning_date: toDate(body.commissioning_date),
        country: body.country,
        state: body.state,
        city: body.city,
        serial_no: body.serial_no,
        model: body.model,
        make: body.make,
        manufacturer: body.manufacturer,
        client_id: body.client_id,
        
        // Relations
        category_id: toInt(body.category_id),
        department_id: toInt(body.department_id),
        location_id: toInt(body.location_id),
        status: body.status,
        
        // Financial
        depreciation_period: toInt(body.depreciation_period),
        asset_cost: toFloat(body.asset_cost),
        useful_life: toInt(body.useful_life),
        purchase_date: toDate(body.purchase_date),
        current_asset_value: toFloat(body.current_asset_value),
        salvage_value: toFloat(body.salvage_value),
        depreciation: body.depreciation,
        
        // Media
        photos: body.photos,
        videos: body.videos,
        
        // Other
        description: body.description,
      },
    });
    
    // LOG CHANGES - Compare old and new values
    const changes: { field: string; old: any; new: any }[] = [];
    
    if (oldAsset.asset_name !== asset.asset_name) {
      changes.push({ field: 'asset_name', old: oldAsset.asset_name, new: asset.asset_name });
    }
    if (oldAsset.status !== asset.status) {
      changes.push({ field: 'status', old: oldAsset.status, new: asset.status });
    }
    if (oldAsset.location_id !== asset.location_id) {
      changes.push({ field: 'location_id', old: oldAsset.location_id, new: asset.location_id });
    }
    if (oldAsset.department_id !== asset.department_id) {
      changes.push({ field: 'department_id', old: oldAsset.department_id, new: asset.department_id });
    }
    if (oldAsset.category_id !== asset.category_id) {
      changes.push({ field: 'category_id', old: oldAsset.category_id, new: asset.category_id });
    }
    if (oldAsset.serial_no !== asset.serial_no) {
      changes.push({ field: 'serial_no', old: oldAsset.serial_no, new: asset.serial_no });
    }
    if (oldAsset.model !== asset.model) {
      changes.push({ field: 'model', old: oldAsset.model, new: asset.model });
    }
    if (oldAsset.make !== asset.make) {
      changes.push({ field: 'make', old: oldAsset.make, new: asset.make });
    }
    if (oldAsset.manufacturer !== asset.manufacturer) {
      changes.push({ field: 'manufacturer', old: oldAsset.manufacturer, new: asset.manufacturer });
    }
    if (oldAsset.asset_cost !== asset.asset_cost) {
      changes.push({ field: 'asset_cost', old: oldAsset.asset_cost, new: asset.asset_cost });
    }
    if (oldAsset.current_asset_value !== asset.current_asset_value) {
      changes.push({ field: 'current_asset_value', old: oldAsset.current_asset_value, new: asset.current_asset_value });
    }
    if (oldAsset.depreciation_period !== asset.depreciation_period) {
      changes.push({ field: 'depreciation_period', old: oldAsset.depreciation_period, new: asset.depreciation_period });
    }
    if (oldAsset.useful_life !== asset.useful_life) {
      changes.push({ field: 'useful_life', old: oldAsset.useful_life, new: asset.useful_life });
    }
    if (oldAsset.assigned_to !== asset.assigned_to) {
      changes.push({ field: 'assigned_to', old: oldAsset.assigned_to, new: asset.assigned_to });
    }
    if (oldAsset.description !== asset.description) {
      changes.push({ field: 'description', old: oldAsset.description, new: asset.description });
    }
    
    // Only log if there are actual changes
    for (const change of changes) {
      await auditService.log(
        assetId,
        'UPDATE',
        {
          fieldName: change.field,
          oldValue: change.old,
          newValue: change.new,
        },
        request
      );
    }
    
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