/**
 * Multi-Method Authentication System
 * Wallet Connect, Traditional Auth, Social Login
 */

import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
const ACCESS_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface User {
  id: string;
  email?: string | null;
  walletAddress?: string | null;
  [key: string]: unknown;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  sessionToken?: string;
  refreshToken?: string;
  error?: string;
}

export class AuthService {
  /**
   * Encrypt wallet address
   */
  private encryptWalletAddress(address: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'your-32-byte-encryption-key-here!!', 'utf8');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(address, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt wallet address
   */
  private decryptWalletAddress(encrypted: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'your-32-byte-encryption-key-here!!', 'utf8');
    const [ivHex, authTagHex, encryptedData] = encrypted.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Social login (OAuth) - trusts provider-verified profile
   */
  async authenticateSocial(params: {
    provider: string;
    providerId: string;
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    deviceInfo?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthResult> {
    const { provider, providerId, email, displayName, avatarUrl, deviceInfo, ipAddress, userAgent } =
      params;

    try {
      if (!provider || !providerId) {
        return { success: false, error: 'Missing provider or providerId' };
      }

      // TODO: SocialAccount model not yet implemented
      // Look for existing user by email instead
      let user = null;

      // If no social account but email present, try to link to existing user
      if (!user && email) {
        user = await prisma.user.findFirst({
          where: { email },
        });
      }

      // If still no user, create one
      if (!user) {
        const walletAddress = `0x${crypto
          .createHash('sha256')
          .update(`${provider}:${providerId}:${email || ''}`)
          .digest('hex')
          .slice(0, 40)}`;

        user = await prisma.user.create({
          data: {
            email: email || null,
            walletAddress,
            username: displayName || email?.split('@')[0] || providerId,
          },
        });
      }

      // TODO: SocialAccount model not yet implemented
      // Social account linking disabled until model is implemented

      // Create session
      const session = await this.createSession(user.id, user.walletAddress, deviceInfo, ipAddress, userAgent);

      return {
        success: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
        },
        sessionToken: session.sessionToken,
        refreshToken: session.refreshToken,
      };
    } catch (error) {
      console.error('Social auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Social authentication failed';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Wallet Connect Authentication
   */
  async authenticateWallet(
    walletAddress: string,
    signature?: string,
    deviceInfo?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    try {
      // Verify wallet address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return { success: false, error: 'Invalid wallet address' };
      }

      // Token gating removed - all users can access the app
      // Wallet connection enables rewards and premium features

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { walletAddress },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress,
          },
        });
      } else {
        // TODO: lastCheckIn field not in User model
        // User already exists, no update needed
      }

      // Create session
      const session = await this.createSession(user.id, walletAddress, deviceInfo, ipAddress, userAgent);

      return {
        success: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
        },
        sessionToken: session.sessionToken,
        refreshToken: session.refreshToken,
      };
    } catch (error) {
      console.error('Wallet auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Traditional Email/Password Authentication
   */
  async authenticateEmail(
    email: string,
    password: string,
    deviceInfo?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await prisma.user.findFirst({
        where: { email },
        include: {
          auth: true,
        },
      });

      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if account is locked
      if (user.auth?.lockUntil && user.auth.lockUntil > new Date()) {
        const lockMinutes = Math.ceil((user.auth.lockUntil.getTime() - Date.now()) / 60000);
        return { 
          success: false, 
          error: `Account locked. Try again in ${lockMinutes} minute(s).` 
        };
      }

      // Find or create UserAuth
      let userAuth = user.auth;
      if (!userAuth) {
        // If no UserAuth exists, create one (for backward compatibility)
        const passwordHash = await bcrypt.hash(password, 12);
        userAuth = await prisma.userAuth.create({
          data: {
            userId: user.id,
            passwordHash,
          },
        });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, userAuth.passwordHash);
      
      if (!isValid) {
        // Increment login attempts
        const attempts = (userAuth.loginAttempts || 0) + 1;
        const lockUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes after 5 attempts

        await prisma.userAuth.update({
          where: { id: userAuth.id },
          data: {
            loginAttempts: attempts,
            lockUntil,
          },
        });

        return { success: false, error: 'Invalid credentials' };
      }

      // Reset login attempts on successful login
      if (userAuth.loginAttempts > 0 || userAuth.lockUntil) {
        await prisma.userAuth.update({
          where: { id: userAuth.id },
          data: {
            loginAttempts: 0,
            lockUntil: null,
          },
        });
      }

      // TODO: emailVerified field not in User model - skip verification check
      // Email verification check disabled

      // Create session
      const session = await this.createSession(user.id, user.walletAddress, deviceInfo, ipAddress, userAgent);

      return {
        success: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          // emailVerified: user.emailVerified, // TODO: Field not in User model
        },
        sessionToken: session.sessionToken,
        refreshToken: session.refreshToken,
      };
    } catch (error) {
      console.error('Email auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Create session
   */
  private async createSession(
    userId: string,
    walletAddress: string | null,
    deviceInfo?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ sessionToken: string; refreshToken: string }> {
    const sessionToken = jwt.sign(
      { userId, walletAddress, type: 'access' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    const expiryDate = new Date(Date.now() + ACCESS_TOKEN_EXPIRY);
    const refreshExpiryDate = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);

    // Create session in database
    await prisma.userSession.create({
      data: {
        userId,
        sessionToken,
        refreshToken,
        walletAddress,
        expiryTimestamp: refreshExpiryDate, // Use refresh token expiry for session
        deviceInfo: (deviceInfo || {}) as Prisma.InputJsonValue,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        isActive: true,
      },
    });

    return { sessionToken, refreshToken };
  }

  /**
   * Verify session token
   */
  async verifySession(sessionToken: string): Promise<any> {
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as unknown;
      
      const session = await prisma.userSession.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      if (!session || !session.isActive || session.expiryTimestamp < new Date()) {
        return null;
      }

      // Update last activity
      await prisma.userSession.update({
        where: { id: session.id },
        data: { lastActivity: new Date() },
      });

      return session.user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId?: string };
      
      const session = await prisma.userSession.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || !session.isActive || session.expiryTimestamp < new Date()) {
        return { success: false, error: 'Invalid refresh token' };
      }

      if (!decoded.userId) {
        return { success: false, error: 'Invalid refresh token' };
      }

      // Create new access token
      const newSessionToken = jwt.sign(
        { userId: decoded.userId, type: 'access' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update session with new token
      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          sessionToken: newSessionToken,
          lastActivity: new Date(),
        },
      });

      return {
        success: true,
        sessionToken: newSessionToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      return { success: false, error: 'Invalid refresh token' };
    }
  }

  /**
   * Logout
   */
  async logout(sessionToken: string): Promise<boolean> {
    try {
      await prisma.userSession.updateMany({
        where: { sessionToken },
        data: { isActive: false },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Register new user with email/password
   */
  async registerEmail(
    email: string,
    password: string,
    username?: string
  ): Promise<AuthResult> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Validate password strength
      if (password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters' };
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }

      // Generate a deterministic wallet address from email (for fiat-only users)
      const walletAddress = `0x${Buffer.from(email).toString('hex').slice(0, 40).padStart(40, '0')}`;

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Create user with auth
      const user = await prisma.user.create({
        data: {
          email,
          walletAddress,
          username: username || email.split('@')[0],
          // emailVerified: false, // TODO: Field not in User model
          // emailVerificationToken, // TODO: Field not in User model
          auth: {
            create: {
              passwordHash,
              loginAttempts: 0,
            },
          },
        },
      });

      // TODO: Send email verification email here
      // await this.sendVerificationEmail(email, emailVerificationToken);

      return {
        success: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          // emailVerified: user.emailVerified, // TODO: Field not in User model
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<AuthResult> {
    try {
      // TODO: emailVerificationToken and emailVerified fields not in User model
      // Email verification disabled until fields are added
      return { success: false, error: 'Email verification not yet implemented' };
      // const user = await prisma.user.findFirst({
      //   where: { emailVerificationToken: token },
      // });

      // if (!user) {
      //   return { success: false, error: 'Invalid verification token' };
      // }

      // if (user.emailVerified) {
      //   return { success: false, error: 'Email already verified' };
      // }

      // await prisma.user.update({
      //   where: { id: user.id },
      //   data: {
      //     emailVerified: true,
      //     emailVerificationToken: null,
      //   },
      // });

      // return { success: true };
    } catch (error: unknown) {
      console.error('Email verification error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Email verification failed' };
    }
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(email: string): Promise<AuthResult> {
    try {
      const user = await prisma.user.findFirst({
        where: { email },
        include: { auth: true },
      });

      if (!user || !user.auth) {
        // Don't reveal if user exists for security
        return { success: true }; // Return success even if user doesn't exist
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.userAuth.update({
        where: { id: user.auth.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
        },
      });

      // TODO: Send password reset email here
      // await this.sendPasswordResetEmail(email, resetToken);

      return { success: true };
    } catch (error) {
      console.error('Password reset token generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      if (newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters' };
      }

      const userAuth = await prisma.userAuth.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            gt: new Date(),
          },
        },
        include: { user: true },
      });

      if (!userAuth) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await prisma.userAuth.update({
        where: { id: userAuth.id },
        data: {
          passwordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
          loginAttempts: 0,
          lockUntil: null,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
}

export const authService = new AuthService();

/**
 * Simple auth helper for API routes
 * Extracts userId from request body (for POST) or headers (JWT)
 * Note: For POST requests, call this AFTER reading the body
 */
export function getUserIdFromBody(body: unknown): string | null {
  return (body as { userId?: string })?.userId || null;
}

/**
 * Extract userId from JWT token in Authorization header
 */
export function getUserIdFromHeader(request: Request): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; id?: string };
        return decoded.userId || decoded.id || null;
      } catch {
        // Invalid token
        return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Stub for next-auth compatibility (for routes that still reference it)
export const authOptions = {};
export async function getServerSession(options: unknown): Promise<{ user: { id: string } } | null> {
  // This is a stub - routes should use getUserIdFromRequest instead
  return null;
}

