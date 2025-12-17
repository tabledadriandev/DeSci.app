import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { address, message, history, healthContext } = await request.json();

    if (!address || !message) {
      return NextResponse.json(
        { error: 'Address and message required' },
        { status: 400 }
      );
    }

    // Get user profile for context
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: address },
          { email: address },
        ],
      },
      include: { 
        profile: true, 
        healthData: { take: 10, orderBy: { recordedAt: 'desc' } },
        healthAssessments: { orderBy: { createdAt: 'desc' }, take: 1 },
        healthScores: { orderBy: { date: 'desc' }, take: 1 },
        biomarkers: { orderBy: { recordedAt: 'desc' }, take: 5 },
      },
    });

    // Build context from user data and healthContext
    let systemContext = `You are an expert AI health coach specializing in longevity, wellness, biomarker optimization, nutrition, exercise, and preventive medicine. 
You help users optimize their health, understand their biomarkers, interpret lab results, plan meals, manage stress, and make informed decisions about supplements, diet, and lifestyle.

IMPORTANT: This is informational guidance only. Always remind users to consult healthcare professionals for medical advice.

User Health Context:`;
    
    if (user?.profile) {
      systemContext += `\n- Age: ${user.profile.age || 'Not specified'}`;
      systemContext += `\n- Health Goals: ${user.profile.healthGoals?.join(', ') || 'General wellness'}`;
      systemContext += `\n- Dietary Restrictions: ${user.profile.dietaryRestrictions?.join(', ') || 'None'}`;
      systemContext += `\n- Activity Level: ${user.profile.activityLevel || 'Not specified'}`;
    }

    if (healthContext) {
      if (healthContext.healthScore) {
        systemContext += `\n- Current Health Score: ${healthContext.healthScore.toFixed(1)}/100`;
      }
      if (healthContext.riskScores) {
        systemContext += `\n- Risk Scores: Heart Disease ${healthContext.riskScores.heartDisease?.toFixed(1) || 'N/A'}%, Diabetes ${healthContext.riskScores.diabetes?.toFixed(1) || 'N/A'}%`;
      }
      if (healthContext.recentBiomarkers && healthContext.recentBiomarkers.length > 0) {
        systemContext += `\n- Recent Biomarkers:`;
        healthContext.recentBiomarkers.slice(0, 3).forEach((b: any) => {
          if (b.bloodGlucose) systemContext += `\n  Blood Glucose: ${b.bloodGlucose} mg/dL`;
          if (b.cholesterolTotal) systemContext += `\n  Total Cholesterol: ${b.cholesterolTotal} mg/dL`;
          if (b.bloodPressureSystolic) systemContext += `\n  Blood Pressure: ${b.bloodPressureSystolic}/${b.bloodPressureDiastolic} mmHg`;
        });
      }
    }

    if (user?.healthData && user.healthData.length > 0) {
      systemContext += `\n- Recent Health Data:`;
      user.healthData.slice(0, 5).forEach((data: any) => {
        systemContext += `\n  ${data.type}: ${data.value} ${data.unit || ''}`;
      });
    }

    systemContext += `\n\nYou have access to specialized coaching modules:
- Nutrition Optimization (meal analysis, polyphenol optimization, meal planning)
- Fitness & Movement (workout plans, form correction, recovery)
- Sleep Optimization (bedtime routines, environment, supplements)
- Stress & Mental Wellness (CBT techniques, breathwork, biomarker interpretation)
- Longevity & Anti-Aging (biological age reduction, telomere health, NAD+)
- Disease Prevention (cardiovascular, diabetes, cancer risk reduction)
- Biomarker Interpretation (lab results, trends, optimal ranges)

Provide personalized, evidence-based advice. Be encouraging, actionable, and specific. Reference the user's health data when relevant. When appropriate, suggest using specialized modules for deeper analysis.`;

    // Build conversation history
    const messages: any[] = [
      { role: 'system', content: systemContext },
      ...(history || []).slice(-10), // Last 10 messages for context
      { role: 'user', content: message },
    ];

    // Call OpenAI
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 1000, // Increased for more detailed responses
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('AI Coach error:', error);
    
    // Fallback response if OpenAI fails
    return NextResponse.json({
      response: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
    });
  }
}

