/**
 * Prisma Caching Layer with Redis
 * 
 * Provides query result caching to reduce database load and improve performance.
 * Implements cache invalidation strategies for data consistency.
 */

import { prisma } from './prisma';
import { redisCache } from './redis';

const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

/**
 * Cache key generators
 */
const cacheKeys = {
  user: (id: string) => `prisma:user:${id}`,
  userByWallet: (address: string) => `prisma:user:wallet:${address}`,
  userByEmail: (email: string) => `prisma:user:email:${email}`,
  healthData: (userId: string) => `prisma:health:${userId}`,
  healthScore: (userId: string) => `prisma:healthscore:${userId}`,
  session: (token: string) => `prisma:session:${token}`,
  biomarker: (id: string) => `prisma:biomarker:${id}`,
  testResult: (id: string) => `prisma:testresult:${id}`,
};

/**
 * Prisma Cache Service
 */
export class PrismaCache {
  /**
   * Get cached user by ID
   */
  async getUser(id: string): Promise<any | null> {
    const key = cacheKeys.user(id);
    const cached = await redisCache.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (user) {
      await redisCache.set(key, JSON.stringify(user), CACHE_TTL.MEDIUM);
    }

    return user;
  }

  /**
   * Get cached user by wallet address
   */
  async getUserByWallet(walletAddress: string): Promise<any | null> {
    const key = cacheKeys.userByWallet(walletAddress);
    const cached = await redisCache.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { profile: true },
    });

    if (user) {
      await redisCache.set(key, JSON.stringify(user), CACHE_TTL.MEDIUM);
    }

    return user;
  }

  /**
   * Get cached user by email
   */
  async getUserByEmail(email: string): Promise<any | null> {
    const key = cacheKeys.userByEmail(email);
    const cached = await redisCache.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await prisma.user.findFirst({
      where: { email },
      include: { profile: true },
    });

    if (user) {
      await redisCache.set(key, JSON.stringify(user), CACHE_TTL.MEDIUM);
    }

    return user;
  }

  /**
   * Get cached health score
   */
  async getHealthScore(userId: string): Promise<any | null> {
    const key = cacheKeys.healthScore(userId);
    const cached = await redisCache.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const healthScore = await prisma.healthScore.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (healthScore) {
      await redisCache.set(key, JSON.stringify(healthScore), CACHE_TTL.SHORT);
    }

    return healthScore;
  }

  /**
   * Get cached session
   */
  async getSession(sessionToken: string): Promise<any | null> {
    const key = cacheKeys.session(sessionToken);
    const cached = await redisCache.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const session = await prisma.userSession.findUnique({
      where: { sessionToken },
      include: { user: { include: { profile: true } } },
    });

    if (session && session.isActive) {
      await redisCache.set(key, JSON.stringify(session), CACHE_TTL.SHORT);
    }

    return session;
  }

  /**
   * Invalidate user cache
   */
  async invalidateUser(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    
    if (user) {
      // Invalidate all user-related cache keys
      await Promise.all([
        redisCache.delete(cacheKeys.user(userId)),
        redisCache.delete(cacheKeys.userByWallet(user.walletAddress)),
        user.email && redisCache.delete(cacheKeys.userByEmail(user.email)),
        redisCache.delete(cacheKeys.healthScore(userId)),
        redisCache.delete(cacheKeys.healthData(userId)),
      ]);
    }
  }

  /**
   * Invalidate health data cache
   */
  async invalidateHealthData(userId: string): Promise<void> {
    await redisCache.delete(cacheKeys.healthData(userId));
    await redisCache.delete(cacheKeys.healthScore(userId));
  }

  /**
   * Invalidate session cache
   */
  async invalidateSession(sessionToken: string): Promise<void> {
    await redisCache.delete(cacheKeys.session(sessionToken));
  }

  /**
   * Generic cache wrapper for any Prisma query
   */
  async cacheQuery<T>(
    key: string,
    query: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    const cached = await redisCache.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await query();
    
    if (result !== null && result !== undefined) {
      await redisCache.set(key, JSON.stringify(result), ttl);
    }

    return result;
  }

  /**
   * Clear all cache (use with caution)
   */
  async clearAll(): Promise<void> {
    // Note: This is a simple implementation
    // In production, you might want to use Redis SCAN to delete keys by pattern
    console.warn('clearAll() called - this should be used carefully in production');
  }
}

export const prismaCache = new PrismaCache();

