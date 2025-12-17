import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...assessmentData } = body;

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          walletAddress: userId.startsWith('0x') ? userId : `0x${Buffer.from(userId).toString('hex').slice(0, 40).padStart(40, '0')}`,
          email: userId.includes('@') ? userId : null,
          username: userId.includes('@') ? userId.split('@')[0] : null,
        },
      });
    }

    // Create health assessment
    const assessment = await prisma.healthAssessment.create({
      data: {
        userId: user.id,
        chronicConditions: assessmentData.chronicConditions || [],
        pastSurgeries: assessmentData.pastSurgeries || [],
        currentMedications: assessmentData.currentMedications || [],
        familyHistory: assessmentData.familyHistory || [],
        sleepHours: assessmentData.sleepHours,
        stressLevel: assessmentData.stressLevel,
        exerciseFrequency: assessmentData.exerciseFrequency,
        exerciseType: assessmentData.exerciseType || [],
        mealFrequency: assessmentData.mealFrequency,
        foodGroups: assessmentData.foodGroups || [],
        dietaryRestrictions: assessmentData.dietaryRestrictions || [],
        waterIntake: assessmentData.waterIntake,
        anxietyLevel: assessmentData.anxietyLevel,
        depressionIndicators: assessmentData.depressionIndicators || [],
        moodStability: assessmentData.moodStability,
        currentSymptoms: assessmentData.currentSymptoms || [],
        symptomSeverity: assessmentData.symptomSeverity || [],
        concerns: assessmentData.concerns || [],
        heartDiseaseRisk: assessmentData.heartDiseaseRisk,
        diabetesRisk: assessmentData.diabetesRisk,
        hypertensionRisk: assessmentData.hypertensionRisk,
        strokeRisk: assessmentData.strokeRisk,
        metabolicSyndromeRisk: assessmentData.metabolicSyndromeRisk,
        overallRiskScore: assessmentData.overallRiskScore,
        healthProfile: {
          assessmentDate: new Date().toISOString(),
          summary: 'Comprehensive health assessment completed',
        },
        recommendations: generateRecommendations(assessmentData),
      },
    });

    // Generate initial health score
    const healthScore = await calculateHealthScore(user.id, assessment);

    return NextResponse.json({
      success: true,
      assessment,
      riskScores: {
        heartDiseaseRisk: assessment.heartDiseaseRisk,
        diabetesRisk: assessment.diabetesRisk,
        hypertensionRisk: assessment.hypertensionRisk,
        strokeRisk: assessment.strokeRisk,
        metabolicSyndromeRisk: assessment.metabolicSyndromeRisk,
        overallRiskScore: assessment.overallRiskScore,
      },
      healthScore,
    });
  } catch (error: any) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment', details: error.message },
      { status: 500 }
    );
  }
}

function generateRecommendations(data: any): string[] {
  const recommendations: string[] = [];

  if (data.heartDiseaseRisk && data.heartDiseaseRisk > 30) {
    recommendations.push('Consider regular cardiovascular monitoring');
    recommendations.push('Increase physical activity to reduce heart disease risk');
  }

  if (data.diabetesRisk && data.diabetesRisk > 30) {
    recommendations.push('Monitor blood glucose levels regularly');
    recommendations.push('Focus on whole grains and reduce refined sugars');
  }

  if (data.stressLevel && data.stressLevel > 7) {
    recommendations.push('Implement stress management techniques (meditation, yoga)');
    recommendations.push('Ensure adequate sleep (7-9 hours per night)');
  }

  if (!data.exerciseFrequency || data.exerciseFrequency === 'rarely' || data.exerciseFrequency === 'never') {
    recommendations.push('Start with 30 minutes of moderate exercise 3x per week');
  }

  if (data.sleepHours && data.sleepHours < 7) {
    recommendations.push('Aim for 7-9 hours of quality sleep per night');
  }

  if (data.foodGroups && data.foodGroups.length < 4) {
    recommendations.push('Diversify your diet to include more food groups');
  }

  return recommendations;
}

async function calculateHealthScore(userId: string, assessment: any) {
  // Calculate comprehensive health score
  let score = 100;

  // Deduct points based on risk factors
  if (assessment.overallRiskScore) {
    score -= assessment.overallRiskScore * 0.5;
  }

  // Lifestyle factors
  if (assessment.sleepHours && assessment.sleepHours < 7) score -= 10;
  if (assessment.stressLevel && assessment.stressLevel > 7) score -= 10;
  if (assessment.exerciseFrequency === 'rarely' || assessment.exerciseFrequency === 'never') score -= 15;
  if (assessment.foodGroups && assessment.foodGroups.length < 4) score -= 10;

  // Mental health
  if (assessment.anxietyLevel && assessment.anxietyLevel > 7) score -= 10;
  if (assessment.depressionIndicators && assessment.depressionIndicators.length > 3) score -= 15;

  const overallScore = Math.max(0, Math.min(100, score));
  
  // Calculate category scores
  const cardiovascularScore = Math.max(0, 100 - (assessment.heartDiseaseRisk || 0));
  const metabolicScore = Math.max(0, 100 - (assessment.diabetesRisk || 0));
  const mentalWellnessScore = Math.max(0, 100 - ((assessment.anxietyLevel || 0) * 5 + (assessment.depressionIndicators?.length || 0) * 5));
  const physicalFitnessScore = assessment.exerciseFrequency === 'daily' ? 90 : assessment.exerciseFrequency === 'weekly' ? 70 : 50;
  const nutritionScore = assessment.foodGroups?.length >= 6 ? 90 : assessment.foodGroups?.length >= 4 ? 70 : 50;
  const sleepScore = assessment.sleepHours && assessment.sleepHours >= 7 && assessment.sleepHours <= 9 ? 90 : assessment.sleepHours && assessment.sleepHours >= 6 && assessment.sleepHours <= 10 ? 70 : 50;

  const healthScore = await prisma.healthScore.create({
    data: {
      userId,
      overallScore,
      cardiovascularScore,
      metabolicScore,
      mentalWellnessScore,
      physicalFitnessScore,
      nutritionScore,
      sleepScore,
      breakdown: {
        riskFactors: assessment.overallRiskScore,
        lifestyle: {
          sleep: assessment.sleepHours,
          exercise: assessment.exerciseFrequency,
          stress: assessment.stressLevel,
        },
      },
    },
  });

  return healthScore;
}

