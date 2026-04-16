import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/common/middleware/rate-limit.middleware';
import { withRequestLogging } from '@/common/middleware/withRequestLogging';
import { logger } from '@/common/utils';
import { getSession } from '@/lib/auth';

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
      assignedUser: {  // ← Include assigned user details
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
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
  const { asset_code, asset_name, category_id, status, purchase_date, purchase_amount, description } = body;
  
  if (!asset_code || !asset_name) {
    return NextResponse.json({ 
      success: false,
      error: 'Asset code and name are required' 
    }, { status: 400 });
  }
  
  const existingAsset = await prisma.asset.findUnique({
    where: { asset_code },
  });
  
  if (existingAsset) {
    return NextResponse.json({ 
      success: false,
      error: 'Asset code already exists' 
    }, { status: 409 });
  }
  
  logger.info('Creating new asset', { 
    asset_code, 
    asset_name, 
    userId: session.userId 
  });
  
  const asset = await prisma.asset.create({
    data: {
      asset_code,
      asset_name,
      category_id: category_id || null,
      status: status || 'Active',
      purchase_date: purchase_date ? new Date(purchase_date) : null,
      purchase_amount: purchase_amount ? parseFloat(purchase_amount) : null,
      description: description || null,
      created_by: session.userId,
    },
  });
  
  return NextResponse.json({ 
    success: true, 
    asset,
    message: 'Asset created successfully'
  }, { status: 201 });
};

export const GET = withRequestLogging(getAssetsHandler, 'GET /api/assets');
export const POST = withRequestLogging(postAssetsHandler, 'POST /api/assets');