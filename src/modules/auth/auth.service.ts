// src/modules/auth/auth.service.ts
import prisma from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { LoginInput, RegisterInput, AuthResponse, UserPayload } from './auth.types';
import { logger } from '@/common/utils';

export class AuthService {
  async login(input: LoginInput): Promise<AuthResponse> {
    logger.info('Login attempt', { email: input.email });
    
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    
    if (!user) {
      logger.warn('Login failed - user not found', { email: input.email });
      throw new Error('Invalid credentials');
    }
    
    const isValid = comparePassword(input.password, user.password_hash);
    if (!isValid) {
      logger.warn('Login failed - invalid password', { email: input.email });
      throw new Error('Invalid credentials');
    }
    
    const token = generateToken(user.id, user.email, user.role);
    
    logger.info('Login successful', { userId: user.id, email: user.email });
    
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    logger.info('Registration attempt', { email: input.email });
    
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });
    
    if (existingUser) {
      logger.warn('Registration failed - user exists', { email: input.email });
      throw new Error('User already exists');
    }
    
    const { hashPassword } = await import('@/lib/auth');
    const password_hash = hashPassword(input.password);
    
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password_hash,
        name: input.name,
        role: input.role || 'employee',
      },
    });
    
    const token = generateToken(user.id, user.email, user.role);
    
    logger.info('Registration successful', { userId: user.id, email: user.email });
    
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getCurrentUser(userId: number): Promise<UserPayload | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
    
    return user;
  }
}