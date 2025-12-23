/**
 * Environment Variable Validation with Zod
 * 
 * Validates all environment variables at startup to fail fast on missing/invalid config.
 * Provides type-safe access to environment variables throughout the application.
 */

import { z } from 'zod';

// Define the environment schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Redis
  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.string().regex(/^\d+$/).transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  
  // JWT Secrets
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  
  // Encryption
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),
  
  // Web3
  NEXT_PUBLIC_BASE_RPC_URL: z.string().url().optional(),
  NEXT_PUBLIC_TA_TOKEN_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  NEXT_PUBLIC_CHAIN_ID: z.string().regex(/^\d+$/).transform(Number).default('8453'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1).optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  
  // Farcaster
  FARCASTER_MNEMONIC: z.string().optional(),
  FARCASTER_APP_FID: z.string().optional(),
  
  // Coinbase
  COINBASE_API_KEY: z.string().optional(),
  COINBASE_API_SECRET: z.string().optional(),
  
  // zkTLS / TLSNotary
  ZKTLS_VERIFIER_URL: z.string().url().optional(),
  TLSNOTARY_API_KEY: z.string().optional(),
  
  // IPFS / Arweave
  PINATA_API_KEY: z.string().optional(),
  PINATA_SECRET_KEY: z.string().optional(),
  ARWEAVE_WALLET: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PHASE: z.string().optional(),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Table d'Adrian Wellness"),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('60000'), // 1 minute
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default('100'),
  
  // Security
  CSRF_SECRET: z.string().min(32).optional(),
  ALLOWED_ORIGINS: z.string().optional(), // Comma-separated list of allowed origins
});

// Parse and validate environment variables
function getEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `❌ Invalid environment variables:\n${missingVars.join('\n')}\n\n` +
        `Please check your .env file and ensure all required variables are set.`
      );
    }
    throw error;
  }
}

// Export validated environment variables
export const env = getEnv();

// Type for environment variables (useful for TypeScript)
export type Env = z.infer<typeof envSchema>;

// Helper to check if we're in production
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// Helper to get allowed origins
export const getAllowedOrigins = (): string[] => {
  if (!env.ALLOWED_ORIGINS) {
    return isProduction 
      ? [env.NEXT_PUBLIC_APP_URL || 'https://tabledadrian.com']
      : ['http://localhost:3000', 'http://localhost:3001'];
  }
  return env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
};

