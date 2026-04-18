// src/modules/audit/audit.service.ts
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export class AuditService {
  async log(
    assetId: number,
    action: string,
    details?: {
      fieldName?: string;
      oldValue?: any;
      newValue?: any;
      additionalDetails?: any;
    },
    request?: Request
  ) {
    try {
      const session = await getSession();
      
      // Get IP and User Agent from request if available
      let ipAddress: string | undefined;
      let userAgent: string | undefined;
      
      if (request) {
        ipAddress = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    undefined;
        userAgent = request.headers.get('user-agent') || undefined;
      }
      
      await prisma.auditLog.create({
        data: {
          asset_id: assetId,
          user_id: session?.userId || 0,
          action,
          field_name: details?.fieldName,
          old_value: details?.oldValue ? String(details.oldValue) : null,
          new_value: details?.newValue ? String(details.newValue) : null,
          details: details?.additionalDetails || undefined,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logging shouldn't break the main flow
    }
  }

  async getAssetHistory(assetId: number) {
    const logs = await prisma.auditLog.findMany({
      where: { asset_id: assetId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    
    return logs;
  }

  async getAllAuditLogs(limit: number = 100, offset: number = 0) {
    const logs = await prisma.auditLog.findMany({
      include: {
        asset: {
          select: {
            id: true,
            asset_code: true,
            asset_name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });
    
    const total = await prisma.auditLog.count();
    
    return { logs, total };
  }

  async getAuditLogsByUser(userId: number, limit: number = 50) {
    return await prisma.auditLog.findMany({
      where: { user_id: userId },
      include: {
        asset: {
          select: {
            id: true,
            asset_code: true,
            asset_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }
}