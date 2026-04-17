import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/common/middleware/rate-limit.middleware';
import { withRequestLogging } from '@/common/middleware/withRequestLogging';
import { logger } from '@/common/utils';
import { getSession } from '@/lib/auth';
import { env } from '@/config';

const limiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: 'Too many requests. Please slow down.',
});

const getAssetsHandler = async (request: NextRequest) => {
  const rateLimitResponse = await limiter(request);
  if (rateLimitResponse) return rateLimitResponse;
  
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  logger.info('Fetching assets', { userId: session.userId });
  
  const assets = await prisma.asset.findMany({
    include: {
      category: true,
      department: true,
      location: true,
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    },
    orderBy: { created_at: 'desc' },
  });
  
  return NextResponse.json({ 
    success: true, 
    assets,
    count: assets.length,
  });
};

const postAssetsHandler = async (request: NextRequest) => {
  const rateLimitResponse = await limiter(request);
  if (rateLimitResponse) return rateLimitResponse;
  
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  
  // Helper function to convert empty strings to null
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
  
  const asset = await prisma.asset.create({
    data: {
      asset_code: body.asset_code,
      asset_name: body.asset_name,
      
      // Asset Details
      installation_date: toDate(body.installation_date),
      tagged_status: body.tagged_status || 'Not Tagged',
      commissioning_date: toDate(body.commissioning_date),
      country: body.country || 'India',
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
      status: body.status || 'Active',
      
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
      created_by: session.userId,
    },
  });
  
  logger.info('Creating new asset', { 
    asset_code: body.asset_code, 
    asset_name: body.asset_name, 
    userId: session.userId 
  });
  
  // ============================================
  // ADD THIS CODE HERE (after logger.info, before return)
  // ============================================
  // Generate QR code URL
  const qrData = `${process.env.NEXTAUTH_URL}/assets/${asset.id}`;
  
  // Update asset with QR URL
  await prisma.asset.update({
    where: { id: asset.id },
    data: { qr_url: qrData },
  });
  // ============================================
  
  return NextResponse.json({ 
    success: true, 
    asset,
    message: 'Asset created successfully'
  }, { status: 201 });
};

export const GET = withRequestLogging(getAssetsHandler, 'GET /api/assets');
export const POST = withRequestLogging(postAssetsHandler, 'POST /api/assets');