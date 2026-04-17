// src/app/api/assets/[id]/qrcode/png/route.ts
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { env } from '@/config';

export async function GET(
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

    const qrData = `${env.APP_URL}/assets/${assetId}`;
    
    // Generate PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      width: 500,
      margin: 2,
      color: {
        dark: '#b9392c',
        light: '#ffffff',
      },
    });

    return new NextResponse(qrCodeBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qrcode-${asset.asset_code}.png"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('QR Code PNG generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}