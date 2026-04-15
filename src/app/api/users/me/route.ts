import { NextRequest } from 'next/server';
import { ApiResponse } from '@/common/utils';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return ApiResponse.unauthorized('Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      return ApiResponse.notFound('User not found');
    }

    return ApiResponse.success({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return ApiResponse.error('Internal server error', 500);
  }
}