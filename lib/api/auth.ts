/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens for protected API routes
 */

import { jwtVerify } from 'jose';
import { ApiException } from './errorHandler';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production');

export interface AuthUser {
  userId: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Verify authentication token from request headers
 */
export async function verifyAuth(request: Request): Promise<AuthUser> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    throw new ApiException('UNAUTHORIZED', 'No authentication token provided', 401);
  }

  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as AuthUser;
  } catch (error) {
    if (error instanceof Error && error.name === 'JWTExpired') {
      throw new ApiException('TOKEN_EXPIRED', 'Authentication token has expired', 401);
    }
    throw new ApiException('INVALID_TOKEN', 'Invalid authentication token', 401);
  }
}

/**
 * Optional auth - returns user if token is valid, null otherwise
 */
export async function optionalAuth(request: Request): Promise<AuthUser | null> {
  try {
    return await verifyAuth(request);
  } catch {
    return null;
  }
}

/**
 * Wrapper for protected API routes
 */
export function withAuth<T>(
  handler: (req: Request, user: AuthUser) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const user = await verifyAuth(req);
    return await handler(req, user);
  };
}

