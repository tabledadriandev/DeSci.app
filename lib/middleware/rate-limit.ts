/**
 * Rate Limiting Middleware using Redis
 * 
 * Implements per-route and per-user rate limiting to prevent abuse.
 * Falls back to IP-based limiting for unauthenticated requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from '../redis';
import { env } from '../env';

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number; // Seconds until retry is allowed
}

/**
 * Default rate limit configuration
 */
const DEFAULT_OPTIONS: Required<RateLimitOptions> = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  keyGenerator: (req) => {
    // Try to get user ID from session or wallet address
    const sessionToken = req.cookies.get('sessionToken')?.value;
    if (sessionToken) {
      return `rate-limit:session:${sessionToken}`;
    }
    
    // Fallback to IP address
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') ||
               'unknown';
    return `rate-limit:ip:${ip}`;
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

/**
 * Rate limit handler
 */
export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): Promise<RateLimitResult | null> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const key = opts.keyGenerator(req);
  const windowKey = `${key}:window`;
  const countKey = `${key}:count`;

  try {
    // Get current count
    const currentCount = await redisCache.get(countKey);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    // Check if limit exceeded
    if (count >= opts.maxRequests) {
      // Get window expiry
      const windowExpiry = await redisCache.get(windowKey);
      const resetTime = windowExpiry 
        ? new Date(parseInt(windowExpiry, 10))
        : new Date(Date.now() + opts.windowMs);

      const retryAfter = Math.ceil((resetTime.getTime() - Date.now()) / 1000);

      return {
        success: false,
        limit: opts.maxRequests,
        remaining: 0,
        reset: resetTime,
        retryAfter: retryAfter > 0 ? retryAfter : undefined,
      };
    }

    // Increment counter
    const newCount = count + 1;
    
    // Set window if this is the first request in the window
    if (count === 0) {
      const windowExpiry = Date.now() + opts.windowMs;
      await redisCache.set(windowKey, windowExpiry.toString(), Math.ceil(opts.windowMs / 1000));
    }

    // Update count
    await redisCache.set(countKey, newCount.toString(), Math.ceil(opts.windowMs / 1000));

    const resetTime = new Date(Date.now() + opts.windowMs);

    return {
      success: true,
      limit: opts.maxRequests,
      remaining: opts.maxRequests - newCount,
      reset: resetTime,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request (fail open)
    return null;
  }
}

/**
 * Rate limit middleware for Next.js API routes
 */
export async function withRateLimit(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: RateLimitOptions
): Promise<NextResponse> {
  const result = await rateLimit(req, options);

  if (result && !result.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again after ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': result.retryAfter?.toString() || '60',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toISOString(),
        },
      }
    );
  }

  // Add rate limit headers to response
  const response = await handler(req);
  
  if (result) {
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.reset.toISOString());
  }

  return response;
}

/**
 * Predefined rate limit configurations for different route types
 */
export const rateLimitConfigs = {
  // Strict limits for authentication routes
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  
  // Moderate limits for API routes
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  
  // Lenient limits for public routes
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  
  // Very strict limits for sensitive operations
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 requests per hour
  },
};

