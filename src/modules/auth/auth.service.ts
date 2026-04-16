import prisma from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { LoginInput, RegisterInput, AuthResponse } from './auth.types';
import { logger } from '@/common/utils';
import crypto from 'crypto';

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
    
    // Generate access token (7 days)
    const accessToken = generateToken(user.id, user.email, user.role);
    
    // Generate refresh token (30 days)
    const refreshToken = await this.generateRefreshToken(user.id);
    
    logger.info('Login successful', { userId: user.id, email: user.email });
    
    return {
      success: true,
      token: accessToken,
      refreshToken: refreshToken,
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
    
    const accessToken = generateToken(user.id, user.email, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);
    
    logger.info('Registration successful', { userId: user.id, email: user.email });
    
    return {
      success: true,
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async generateRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(40).toString('hex');
    
    await prisma.refreshToken.create({
      data: {
        token: token,
        user_id: userId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    
    return token;
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string } | null> {
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        revoked: false,
        expires_at: { gt: new Date() },
      },
      include: { user: true },
    });
    
    if (!storedToken) {
      logger.warn('Refresh token invalid or expired');
      return null;
    }
    
    const accessToken = generateToken(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role
    );
    
    logger.info('Access token refreshed', { userId: storedToken.user.id });
    
    return { accessToken };
  }

  async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { user_id: userId },
      data: { revoked: true },
    });
    
    logger.info('All refresh tokens revoked', { userId });
  }

  async getCurrentUser(userId: number) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true,
      },
    });
  }
}