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
        biomarkerReadings: { orderBy: { date: 'desc' }, take: 5 },
      },
    });

    // Build context from user data and healthContext
    let systemContext = `You are an expert AI health coach specializing in longevity, wellness, biomarker optimization, nutrition, exercise, and preventive medicine. 
You help users optimize their health, understand their biomarkers, interpret lab results, plan meals, manage stress, and make informed decisions about supplements, diet, and lifestyle.

IMPORTANT: This is informational guidance only. Always remind users to consult healthcare professionals for medical advice.

User Health Context:`;
    
    // User preferences may contain profile-like data
    if (user?.preferences) {
      const prefs = user.preferences as { healthGoals?: string[]; dietaryRestrictions?: string[]; activityLevel?: string };
      systemContext += `\n- Health Goals: ${prefs.healthGoals?.join(', ') || 'General wellness'}`;
      systemContext += `\n- Dietary Restrictions: ${prefs.dietaryRestrictions?.join(', ') || 'None'}`;
      systemContext += `\n- Activity Level: ${prefs.activityLevel || 'Not specified'}`;
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
        healthContext.recentBiomarkers.slice(0, 3).forEach((b: typeof healthContext.recentBiomarkers[0]) => {
          const biomarker = b as { bloodGlucose?: number; cholesterolTotal?: number; bloodPressureSystolic?: number; bloodPressureDiastolic?: number };
          if (biomarker.bloodGlucose) systemContext += `\n  Blood Glucose: ${biomarker.bloodGlucose} mg/dL`;
          if (biomarker.cholesterolTotal) systemContext += `\n  Total Cholesterol: ${biomarker.cholesterolTotal} mg/dL`;
          if (biomarker.bloodPressureSystolic) systemContext += `\n  Blood Pressure: ${biomarker.bloodPressureSystolic}/${biomarker.bloodPressureDiastolic} mmHg`;
        });
      }
    }

    if (user?.biomarkerReadings && user.biomarkerReadings.length > 0) {
      systemContext += `\n- Recent Biomarker Readings:`;
      user.biomarkerReadings.slice(0, 5).forEach((data: typeof user.biomarkerReadings[0]) => {
        const reading = data as { metric?: string; value?: number; unit?: string };
        systemContext += `\n  ${reading.metric || 'Unknown'}: ${reading.value || 'N/A'} ${reading.unit || ''}`;
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
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemContext },
      ...(history || []).slice(-10).map((h: unknown) => {
        const msg = h as { role?: string; content?: string };
        return { role: (msg.role || 'user') as 'system' | 'user' | 'assistant', content: msg.content || '' };
      }), // Last 10 messages for context
      { role: 'user', content: message },
    ];

    // Call OpenAI
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.7,
      max_tokens: 1000, // Increased for more detailed responses
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Coach error:', error);
    
    // Fallback response if OpenAI fails
    return NextResponse.json({
      response: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
    });
  }
}

