// src/app/api/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/modules/audit/audit.service';
import { getSession } from '@/lib/auth';

const auditService = new AuditService();

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('assetId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (assetId) {
      const logs = await auditService.getAssetHistory(parseInt(assetId));
      return NextResponse.json({ success: true, logs });
    } else {
      const { logs, total } = await auditService.getAllAuditLogs(limit, offset);
      return NextResponse.json({ success: true, logs, total });
    }
  } catch (error) {
    console.error('Audit log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}