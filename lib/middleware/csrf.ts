/**
 * CSRF Protection Middleware
 * 
 * Implements Double-Submit Cookie pattern for CSRF protection.
 * Generates and validates CSRF tokens for state-changing operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { redisCache } from '../redis';
import { env } from '../env';

const CSRF_SECRET = env.CSRF_SECRET || env.JWT_SECRET || 'csrf-secret-change-in-production';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Hash a CSRF token with the secret
 */
function hashToken(token: string): string {
  return crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');
}

/**
 * Store CSRF token in Redis
 */
async function storeCsrfToken(token: string, userId?: string): Promise<void> {
  const key = userId 
    ? `csrf:user:${userId}:${token}`
    : `csrf:token:${token}`;
  
  await redisCache.set(key, '1', CSRF_TOKEN_EXPIRY);
}

/**
 * Verify CSRF token from Redis
 */
async function verifyCsrfToken(token: string, userId?: string): Promise<boolean> {
  const key = userId 
    ? `csrf:user:${userId}:${token}`
    : `csrf:token:${token}`;
  
  const exists = await redisCache.get(key);
  return exists !== null;
}

/**
 * Get or create CSRF token for a request
 */
export async function getCsrfToken(req: NextRequest, userId?: string): Promise<string> {
  // Check if token exists in cookie
  const existingToken = req.cookies.get('csrf-token')?.value;
  
  if (existingToken && await verifyCsrfToken(existingToken, userId)) {
    return existingToken;
  }

  // Generate new token
  const newToken = generateCsrfToken();
  await storeCsrfToken(newToken, userId);

  return newToken;
}

/**
 * Verify CSRF token from request
 */
export async function verifyCsrf(
  req: NextRequest,
  userId?: string
): Promise<{ valid: boolean; error?: string }> {
  // Get token from header (preferred) or body
  const headerToken = req.headers.get('x-csrf-token');
  const cookieToken = req.cookies.get('csrf-token')?.value;

  if (!headerToken && !cookieToken) {
    return { valid: false, error: 'CSRF token missing' };
  }

  // Try to get token from body if not in header
  let bodyToken: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    bodyToken = body.csrfToken;
  } catch {
    // Body might not be JSON or already consumed
  }

  const token = headerToken || bodyToken || cookieToken;

  if (!token) {
    return { valid: false, error: 'CSRF token missing' };
  }

  // Verify token exists in Redis
  const isValid = await verifyCsrfToken(token, userId);

  if (!isValid) {
    return { valid: false, error: 'Invalid or expired CSRF token' };
  }

  // Double-submit cookie check
  if (cookieToken && token !== cookieToken) {
    return { valid: false, error: 'CSRF token mismatch' };
  }

  return { valid: true };
}

/**
 * CSRF protection middleware for Next.js API routes
 */
export async function withCsrf(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  userId?: string
): Promise<NextResponse> {
  // Only protect state-changing methods
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const method = req.method;

  if (!protectedMethods.includes(method)) {
    return handler(req);
  }

  // Verify CSRF token
  const verification = await verifyCsrf(req, userId);

  if (!verification.valid) {
    return NextResponse.json(
      {
        error: 'CSRF verification failed',
        message: verification.error || 'Invalid CSRF token',
      },
      { status: 403 }
    );
  }

  return handler(req);
}

/**
 * Add CSRF token to response cookies
 */
export function addCsrfTokenToResponse(
  response: NextResponse,
  token: string
): NextResponse {
  response.cookies.set('csrf-token', token, {
    httpOnly: false, // Must be accessible to JavaScript for double-submit
    secure: env.isProduction,
    sameSite: 'strict',
    maxAge: CSRF_TOKEN_EXPIRY,
    path: '/',
  });

  return response;
}

/**
 * Middleware to inject CSRF token into GET requests
 */
export async function injectCsrfToken(
  req: NextRequest,
  response: NextResponse,
  userId?: string
): Promise<NextResponse> {
  // Only inject for GET requests
  if (req.method !== 'GET') {
    return response;
  }

  const token = await getCsrfToken(req, userId);
  return addCsrfTokenToResponse(response, token);
}

