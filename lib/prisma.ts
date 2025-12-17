import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Skip Prisma initialization during Next.js build or if DATABASE_URL is missing
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
const hasDatabaseUrl = !!process.env.DATABASE_URL

// Generic mock function for all Prisma operations
const createMockModel = () => ({
  findUnique: async () => null,
  findFirst: async () => null,
  findMany: async () => [],
  create: async (args?: any) => ({ id: 'mock', createdAt: new Date(), ...args?.data }),
  update: async (args?: any) => ({ id: 'mock', ...args?.data }),
  updateMany: async () => ({ count: 0 }),
  delete: async () => null,
  deleteMany: async () => ({ count: 0 }),
  count: async () => 0,
  aggregate: async () => ({}),
});

export const prisma = (() => {
  if (isBuildTime || !hasDatabaseUrl) {
    // Return a comprehensive mock client during build or when DATABASE_URL is missing
    return {
      user: createMockModel(),
      healthData: createMockModel(),
      healthScore: createMockModel(),
      marketplaceItem: createMockModel(),
      socialAccount: createMockModel(),
      userAuth: createMockModel(),
      userSession: createMockModel(),
      $connect: async () => {},
      $disconnect: async () => {},
      $transaction: async (fn: any) => fn({}),
    } as any as PrismaClient
  }
  
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }
  
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client
    }
    
    return client
  } catch (error) {
    console.warn('Prisma initialization failed, using mock client:', error)
    return {} as any as PrismaClient
  }
})()

