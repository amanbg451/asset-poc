import { NextRequest } from 'next/server';
import { AuthController } from '@/modules/auth/auth.controller';

export async function POST(request: NextRequest) {
  return AuthController.logout();
}