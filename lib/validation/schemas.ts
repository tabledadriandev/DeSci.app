/**
 * Zod Validation Schemas for API Routes
 * 
 * Provides type-safe request/response validation for all API endpoints.
 */

import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string().email('Invalid email format');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
const walletAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address');
const uuidSchema = z.string().uuid('Invalid UUID format');

// Authentication Schemas
export const authSchemas = {
  register: z.object({
    email: emailSchema,
    password: passwordSchema,
    username: z.string().min(3).max(30).optional(),
  }),
  
  login: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
  
  walletAuth: z.object({
    walletAddress: walletAddressSchema,
    signature: z.string().optional(),
  }),
  
  socialAuth: z.object({
    provider: z.enum(['google', 'apple']),
    providerId: z.string().min(1),
    email: emailSchema.optional().nullable(),
    displayName: z.string().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
  }),
  
  refreshToken: z.object({
    refreshToken: z.string().min(1),
  }),
  
  passwordReset: z.object({
    email: emailSchema,
  }),
  
  resetPassword: z.object({
    token: z.string().min(1),
    newPassword: passwordSchema,
  }),
};

// Health Data Schemas
export const healthSchemas = {
  createHealthData: z.object({
    userId: uuidSchema,
    weight: z.number().positive().optional(),
    height: z.number().positive().optional(),
    bloodPressure: z.object({
      systolic: z.number().positive(),
      diastolic: z.number().positive(),
    }).optional(),
    heartRate: z.number().positive().optional(),
    temperature: z.number().optional(),
    notes: z.string().max(1000).optional(),
  }),
  
  createBiomarker: z.object({
    name: z.string().min(1),
    value: z.number(),
    unit: z.string().min(1),
    date: z.string().datetime().or(z.date()),
    source: z.string().optional(),
  }),
  
  createSymptom: z.object({
    symptom: z.string().min(1),
    severity: z.number().min(1).max(10),
    duration: z.number().positive().optional(),
    notes: z.string().max(1000).optional(),
  }),
  
  createHabit: z.object({
    habitType: z.string().min(1),
    completed: z.boolean(),
    notes: z.string().max(500).optional(),
  }),
};

// Meal & Nutrition Schemas
export const mealSchemas = {
  logMeal: z.object({
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    foods: z.array(z.object({
      foodId: z.string().optional(),
      name: z.string().min(1),
      quantity: z.number().positive(),
      unit: z.string().min(1),
    })),
    date: z.string().datetime().or(z.date()).optional(),
  }),
  
  createMealPlan: z.object({
    name: z.string().min(1),
    startDate: z.string().datetime().or(z.date()),
    endDate: z.string().datetime().or(z.date()),
    meals: z.array(z.object({
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
      foods: z.array(z.object({
        foodId: z.string().optional(),
        name: z.string().min(1),
        quantity: z.number().positive(),
        unit: z.string().min(1),
      })),
    })),
  }),
};

// Coach Schemas
export const coachSchemas = {
  chat: z.object({
    message: z.string().min(1).max(2000),
    context: z.object({
      healthScore: z.number().optional(),
      recentBiomarkers: z.array(z.any()).optional(),
      goals: z.array(z.string()).optional(),
    }).optional(),
    module: z.enum([
      'general',
      'nutrition',
      'fitness',
      'sleep',
      'stress',
      'longevity',
      'disease-prevention',
      'biomarkers',
    ]).optional(),
  }),
  
  quickAction: z.object({
    action: z.string().min(1),
    params: z.record(z.any()).optional(),
  }),
};

// Payment Schemas
export const paymentSchemas = {
  createPaymentIntent: z.object({
    amount: z.number().positive(),
    currency: z.string().length(3).default('USD'),
    paymentMethod: z.enum(['stripe', 'crypto']),
    metadata: z.record(z.string()).optional(),
  }),
  
  createSubscription: z.object({
    planId: z.string().min(1),
    paymentMethodId: z.string().optional(),
  }),
};

// zkTLS Schemas
export const zkTlsSchemas = {
  proveHealthData: z.object({
    dataType: z.enum(['biomarker', 'lab-result', 'symptom', 'health-assessment']),
    dataId: uuidSchema,
    publicFields: z.array(z.string()).optional(), // Fields to make public
    privateFields: z.array(z.string()).optional(), // Fields to keep private
  }),
  
  verifyCredential: z.object({
    credentialType: z.enum(['pharmacist', 'gphc', 'medical-license', 'research-credential']),
    credentialUrl: z.string().url(),
    publicFields: z.array(z.string()).optional(),
  }),
  
  researchProvenance: z.object({
    dataSource: z.string().url(),
    dataHash: z.string().min(1),
    timestamp: z.string().datetime().or(z.date()),
  }),
};

// Marketplace Schemas
export const marketplaceSchemas = {
  purchaseItem: z.object({
    itemId: uuidSchema,
    quantity: z.number().positive().default(1),
    paymentMethod: z.enum(['stripe', 'crypto']),
  }),
};

// Governance Schemas
export const governanceSchemas = {
  createProposal: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(5000),
    proposalType: z.enum(['treasury', 'protocol', 'research', 'partnership']),
    actions: z.array(z.object({
      type: z.string(),
      params: z.record(z.any()),
    })),
  }),
  
  vote: z.object({
    proposalId: uuidSchema,
    support: z.boolean(),
    votingPower: z.number().positive().optional(),
  }),
};

// Helper function to validate request body
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  req: Request
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

// Helper function to validate query parameters
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  query: Record<string, string | string[] | undefined>
): { success: true; data: T } | { success: false; error: z.ZodError } {
  try {
    // Convert query params to object
    const params: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(query)) {
      params[key] = Array.isArray(value) ? value[0] : value;
    }
    
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

