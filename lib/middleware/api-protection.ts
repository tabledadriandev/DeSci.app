/**
 * Combined API Protection Middleware
 * 
 * Combines rate limiting, CSRF protection, and authentication verification
 * for comprehensive API route protection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RateLimitOptions } from './rate-limit';
import { withCsrf, injectCsrfToken, getCsrfToken } from './csrf';
import { authService } from '../auth';
import { getAllowedOrigins } from '../env';

export interface ApiProtectionOptions {
  requireAuth?: boolean;
  requireCsrf?: boolean;
  rateLimit?: RateLimitOptions | false;
  allowedMethods?: string[];
  cors?: boolean;
}

const DEFAULT_OPTIONS: Required<Omit<ApiProtectionOptions, 'rateLimit'>> & { rateLimit: RateLimitOptions | false } = {
  requireAuth: false,
  requireCsrf: true,
  rateLimit: { windowMs: 60000, maxRequests: 60 },
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  cors: true,
};

/**
 * Get user ID from request (from session or wallet)
 */
async function getUserId(req: NextRequest): Promise<string | undefined> {
  const sessionToken = req.cookies.get('sessionToken')?.value;
  
  if (sessionToken) {
    const user = await authService.verifySession(sessionToken);
    return user?.id;
  }

  // Try to get from authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = await authService.verifySession(token);
    return user?.id;
  }

  return undefined;
}

/**
 * Handle CORS
 */
function handleCors(req: NextRequest, response: NextResponse): NextResponse {
  const origin = req.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  }

  return response;
}

/**
 * Comprehensive API protection middleware
 */
export async function withApiProtection(
  req: NextRequest,
  handler: (req: NextRequest, userId?: string) => Promise<NextResponse>,
  options: ApiProtectionOptions = {}
): Promise<NextResponse> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS' && opts.cors) {
    const response = new NextResponse(null, { status: 204 });
    return handleCors(req, response);
  }

  // Check allowed methods
  if (!opts.allowedMethods.includes(req.method)) {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  // Get user ID if authentication is required
  let userId: string | undefined;
  if (opts.requireAuth) {
    userId = await getUserId(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  } else {
    // Still try to get user ID for CSRF token generation
    userId = await getUserId(req);
  }

  // Rate limiting
  if (opts.rateLimit !== false) {
    return withRateLimit(req, async (req) => {
      // CSRF protection
      if (opts.requireCsrf) {
        return withCsrf(req, async (req) => {
          const response = await handler(req, userId);
          
          // Inject CSRF token for GET requests
          if (req.method === 'GET') {
            const token = await getCsrfToken(req, userId);
            response.cookies.set('csrf-token', token, {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 3600,
              path: '/',
            });
          }
          
          // Handle CORS
          if (opts.cors) {
            return handleCors(req, response);
          }
          
          return response;
        }, userId);
      }

      // No CSRF protection
      const response = await handler(req, userId);
      
      // Inject CSRF token for GET requests
      if (req.method === 'GET') {
        const token = await getCsrfToken(req, userId);
        response.cookies.set('csrf-token', token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600,
          path: '/',
        });
      }
      
      // Handle CORS
      if (opts.cors) {
        return handleCors(req, response);
      }
      
      return response;
    }, opts.rateLimit);
  }

  // No rate limiting
  if (opts.requireCsrf) {
    return withCsrf(req, async (req) => {
      const response = await handler(req, userId);
      
      // Inject CSRF token for GET requests
      if (req.method === 'GET') {
        const token = await getCsrfToken(req, userId);
        response.cookies.set('csrf-token', token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600,
          path: '/',
        });
      }
      
      // Handle CORS
      if (opts.cors) {
        return handleCors(req, response);
      }
      
      return response;
    }, userId);
  }

  // No protection
  const response = await handler(req, userId);
  
  // Handle CORS
  if (opts.cors) {
    return handleCors(req, response);
  }
  
  return response;
}

/**
 * Predefined protection configurations
 */
export const apiProtection = {
  // Public API (no auth, rate limited, CSRF protected)
  public: {
    requireAuth: false,
    requireCsrf: true,
    rateLimit: { windowMs: 60000, maxRequests: 100 },
  },
  
  // Authenticated API (auth required, rate limited, CSRF protected)
  authenticated: {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: { windowMs: 60000, maxRequests: 60 },
  },
  
  // Strict API (auth required, strict rate limit, CSRF protected)
  strict: {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  },
  
  // Read-only API (no auth, no CSRF, rate limited)
  readOnly: {
    requireAuth: false,
    requireCsrf: false,
    rateLimit: { windowMs: 60000, maxRequests: 200 },
  },
};

