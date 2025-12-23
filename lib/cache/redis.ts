/**
 * Redis Caching Layer
 * Provides caching for API responses and computed data
 */

let Redis: any = null;
try {
  Redis = require('ioredis').default || require('ioredis');
} catch (error) {
  // ioredis is optional - app works without it
  console.warn('ioredis not installed - Redis caching disabled');
}

let redis: any = null;

/**
 * Initialize Redis connection
 */
export function initRedis() {
  if (redis) return redis;

  if (!Redis) {
    console.warn('ioredis not available - caching disabled');
    return null;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('REDIS_URL not set - caching disabled');
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('error', (err) => {
      console.error('Redis error:', err);
    });

    return redis;
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    return null;
  }
}

/**
 * Get cached value
 */
export async function cacheGet(key: string): Promise<string | null> {
  const client = initRedis();
  if (!client) return null;

  try {
    return await client.get(key);
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set cached value with TTL
 */
export async function cacheSet(
  key: string,
  value: string,
  ttl: number
): Promise<boolean> {
  const client = initRedis();
  if (!client) return false;

  try {
    await client.setex(key, ttl, value);
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

/**
 * Delete cached value
 */
export async function cacheDelete(key: string): Promise<boolean> {
  const client = initRedis();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

/**
 * Get cached JSON object
 */
export async function cacheGetJSON<T>(key: string): Promise<T | null> {
  const value = await cacheGet(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Cache JSON parse error:', error);
    return null;
  }
}

/**
 * Set cached JSON object
 */
export async function cacheSetJSON<T>(
  key: string,
  value: T,
  ttl: number
): Promise<boolean> {
  try {
    const json = JSON.stringify(value);
    return await cacheSet(key, json, ttl);
  } catch (error) {
    console.error('Cache JSON stringify error:', error);
    return false;
  }
}

/**
 * Check if Redis is available
 */
export async function checkRedis(): Promise<'healthy' | 'unhealthy'> {
  const client = initRedis();
  if (!client) return 'unhealthy';

  try {
    await client.ping();
    return 'healthy';
  } catch (error) {
    return 'unhealthy';
  }
}
