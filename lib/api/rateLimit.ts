/**
 * Rate Limiting Middleware
 * 
 * Uses Upstash Redis for distributed rate limiting
 */

import { ApiException } from './errorHandler';

// Fallback to in-memory rate limiting if Upstash not configured
let redisClient: {
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
} | null = null;

try {
  // Try to use Upstash Redis if available
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Dynamic import to avoid errors if package not installed
    import('@upstash/redis').then(({ Redis }) => {
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      }) as {
        incr: (key: string) => Promise<number>;
        expire: (key: string, seconds: number) => Promise<number>;
        ttl: (key: string) => Promise<number>;
      };
    });
  }
} catch {
  // Fallback to in-memory
}

// In-memory fallback for development
const memoryStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  limit: number; // Number of requests
  window: number; // Time window in seconds
  identifier?: string; // Custom identifier (defaults to IP)
}

/**
 * Rate limit check
 */
export async function rateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<{ remaining: number; resetAt: number }> {
  const { limit, window, identifier } = options;

  // Get identifier (IP address or custom)
  const id = identifier || getClientIP(request);
  const key = `rate-limit:${id}`;

  if (redisClient) {
    // Use Upstash Redis
    try {
      const current = await redisClient.incr(key);
      
      if (current === 1) {
        await redisClient.expire(key, window);
      }

      if (current > limit) {
        const ttl = await redisClient.ttl(key);
        throw new ApiException(
          'RATE_LIMIT_EXCEEDED',
          `Too many requests. Please try again in ${ttl} seconds.`,
          429
        );
      }

      const ttl = await redisClient.ttl(key);
      return {
        remaining: Math.max(0, limit - current),
        resetAt: Date.now() + ttl * 1000,
      };
    } catch (error) {
      if (error instanceof ApiException) throw error;
      // Fallback to memory if Redis fails
    }
  }

  // Fallback to in-memory rate limiting
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    memoryStore.set(key, {
      count: 1,
      resetAt: now + window * 1000,
    });
    return {
      remaining: limit - 1,
      resetAt: now + window * 1000,
    };
  }

  if (record.count >= limit) {
    throw new ApiException(
      'RATE_LIMIT_EXCEEDED',
      `Too many requests. Please try again in ${Math.ceil((record.resetAt - now) / 1000)} seconds.`,
      429
    );
  }

  record.count++;
  return {
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Get client IP address from request
 */
function getClientIP(request: Request): string {
  // Check various headers for IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

/**
 * Wrapper for rate-limited API routes
 */
export function withRateLimit(
  options: RateLimitOptions
): (handler: (req: Request) => Promise<Response>) => (req: Request) => Promise<Response> {
  return (handler) => {
    return async (req: Request) => {
      await rateLimit(req, options);
      return await handler(req);
    };
  };
}

