/**
 * Health Assessment API Route
 * 
 * Example of using error handling, auth, and rate limiting middleware
 */

import { NextRequest } from 'next/server';
import { withErrorHandler, ApiException } from '@/lib/api/errorHandler';
import { withAuth } from '@/lib/api/auth';
import { withRateLimit } from '@/lib/api/rateLimit';
import { z } from 'zod';

const assessmentSchema = z.object({
  age: z.number().min(18).max(120),
  gender: z.enum(['M', 'F', 'Other']),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(300),
  familyHistoryDiabetes: z.boolean().optional(),
  familyHistoryHeartDisease: z.boolean().optional(),
  familyHistoryCancer: z.boolean().optional(),
  exercisePerWeek: z.number().min(0).max(10),
  sleepHours: z.number().min(1).max(12),
  stressLevel: z.enum(['low', 'moderate', 'high']),
  dietType: z.enum(['omnivore', 'vegetarian', 'vegan', 'paleo']),
});

async function handleAssessment(req: NextRequest, user: { userId: string }) {
  const body = await req.json();

  // Validate input
  const validationResult = assessmentSchema.safeParse(body);
  if (!validationResult.success) {
    throw new ApiException(
      'VALIDATION_ERROR',
      `Invalid input: ${validationResult.error.errors.map((e) => e.message).join(', ')}`,
      400
    );
  }

  const data = validationResult.data;

  // Calculate BMI
  const bmi = data.weight / ((data.height / 100) ** 2);

  // Calculate health score (simplified - would use actual calculation)
  const healthScore = Math.round(70 + Math.random() * 20); // Placeholder

  // Save assessment (would save to database)
  const assessmentId = `assessment_${Date.now()}`;

  return Response.json({
    success: true,
    data: {
      id: assessmentId,
      userId: user.userId,
      healthScore,
      bmi: Math.round(bmi * 10) / 10,
      recommendations: [
        'Maintain regular exercise routine',
        'Get 7-9 hours of sleep nightly',
        'Monitor glucose levels quarterly',
      ],
    },
  });
}

// Apply rate limiting (100 requests per hour)
const rateLimitedHandler = withRateLimit({
  limit: 100,
  window: 3600,
})(handleAssessment);

// Apply authentication
const authenticatedHandler = withAuth(rateLimitedHandler);

// Apply error handling
export const POST = withErrorHandler(authenticatedHandler);

