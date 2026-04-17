// src/app/api/assets/[id]/qrcode/route.ts
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

    // Create QR code data (URL to asset page)
    const qrData = `${env.APP_URL}/assets/${assetId}`;
    
    // Generate QR code as SVG (can also do 'png' or 'svg')
    const qrCodeSvg = await QRCode.toString(qrData, {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: '#b9392c', // Your brand color
        light: '#ffffff',
      },
    });

    // Also store QR URL in database for future use
    await prisma.asset.update({
      where: { id: assetId },
      data: { qr_url: qrData },
    });

    return new NextResponse(qrCodeSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}