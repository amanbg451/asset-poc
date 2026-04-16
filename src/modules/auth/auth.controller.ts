import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/common/middleware/error.middleware';
import { AuthService } from './auth.service';
import { validateLogin, validateRegister } from './auth.validators';
import { UnauthorizedError, ConflictError } from '@/common/errors';
import { env } from '@/config';
import { getSession } from '@/lib/auth';

const authService = new AuthService();

export class AuthController {
  static async login(request: NextRequest) {
    try {
      const body = await request.json();
      
      const result = validateLogin(body);
      if (!result.success) {
        throw result.error;
      }
      
      const { email, password } = result.data;
      const loginResult = await authService.login({ email, password });
      
      const response = NextResponse.json({
        success: true,
        user: loginResult.user,
        refreshToken: loginResult.refreshToken,
      });
      
      response.cookies.set('token', loginResult.token, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      
      return response;
      
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return handleError(new UnauthorizedError('Invalid credentials'));
      }
      return handleError(error);
    }
  }

  static async register(request: NextRequest) {
    try {
      const body = await request.json();
      
      const result = validateRegister(body);
      if (!result.success) {
        throw result.error;
      }
      
      const { email, password, name, role } = result.data;
      const registerResult = await authService.register({ 
        email, 
        password, 
        name, 
        role: role || 'employee' 
      });
      
      const response = NextResponse.json({
        success: true,
        user: registerResult.user,
        refreshToken: registerResult.refreshToken,
      }, { status: 201 });
      
      response.cookies.set('token', registerResult.token, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      
      return response;
      
    } catch (error) {
      if (error instanceof Error && error.message === 'User already exists') {
        return handleError(new ConflictError('User already exists'));
      }
      return handleError(error);
    }
  }

  static async logout(request: NextRequest) {
    try {
      const session = await getSession();
      
      if (session?.userId) {
        await authService.revokeAllUserRefreshTokens(session.userId);
      }
      
      const response = NextResponse.json({ success: true });
      
      response.cookies.set('token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
      });
      
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}