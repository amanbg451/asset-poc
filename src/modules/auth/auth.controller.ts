// src/modules/auth/auth.controller.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/common/middleware/error.middleware';
import { AuthService } from './auth.service';
import { validateLogin, validateRegister } from './auth.validators';
import { UnauthorizedError, ConflictError } from '@/common/errors';
import { env } from '@/config';

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
      
      // Create response with HTTP-only cookie
      const response = NextResponse.json({
        success: true,
        user: loginResult.user,
      });
      
      // Set HTTP-only cookie (more secure than localStorage)
      response.cookies.set('token', loginResult.token, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
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
      
      // Create response with HTTP-only cookie
      const response = NextResponse.json({
        success: true,
        user: registerResult.user,
      }, { status: 201 });
      
      // Set HTTP-only cookie
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

  static async logout() {
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('token', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
    
    return response;
  }
}