/**
 * AI Health Coach Specialized Modules
 * Each module provides domain-specific coaching expertise
 */

import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

interface UserProfile {
  healthGoals?: string[];
  dietaryRestrictions?: string[];
  [key: string]: unknown;
}

interface RiskScores {
  cardiovascular?: number;
  metabolic?: number;
  [key: string]: unknown;
}

interface WellnessPlan {
  nutrition?: unknown;
  exercise?: unknown;
  [key: string]: unknown;
}

interface MealData {
  foods?: unknown[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  [key: string]: unknown;
}

interface SleepConditions {
  temperature?: number;
  light?: string;
  sound?: string;
  airQuality?: string;
  [key: string]: unknown;
}

interface StressBiomarkers {
  cortisol?: number | { morning?: number; evening?: number };
  hrv?: number;
  heartRate?: number;
  sleepQuality?: number;
  crp?: number;
  [key: string]: unknown;
}

interface RiskFactors {
  age?: number;
  familyHistory?: boolean;
  smoking?: boolean;
  [key: string]: unknown;
}

interface Biomarkers {
  glucose?: number;
  hba1c?: number;
  insulin?: number;
  [key: string]: unknown;
}

interface LabResults {
  [key: string]: {
    value: number;
    unit: string;
    referenceRange?: string;
    flag?: string;
  } | unknown;
}

export interface UserHealthContext {
  profile?: UserProfile;
  healthData?: unknown[];
  biomarkers?: unknown[];
  healthScore?: number;
  riskScores?: RiskScores;
  mealLogs?: unknown[];
  wellnessPlan?: WellnessPlan;
  cameraAnalyses?: unknown[];
  recentLabResults?: unknown[];
}

export interface CoachingResponse {
  response: string;
  recommendations?: string[];
  actionItems?: Array<{ task: string; priority: 'high' | 'medium' | 'low' }>;
  resources?: Array<{ title: string; description: string; url?: string }>;
}

export class NutritionOptimizationModule {
  async analyzeMeal(
    mealData: MealData,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `You are a nutrition optimization specialist with expertise in:
- Macronutrient and micronutrient analysis
- Polyphenol optimization (target: 1,500mg+ daily)
- Resistant starch identification and fermentation potential
- Glycemic load management
- Meal timing for longevity
- Evidence-based supplement recommendations
- Ancient grain nutrition

User Context:
${this.buildUserContext(userContext)}

Analyze the meal and provide:
1. Detailed feedback on nutritional balance
2. Suggestions to optimize polyphenol content
3. Meal timing recommendations
4. Specific improvements for the user's health goals`;

    const response = await this.callOpenAI(systemPrompt, `Analyze this meal: ${JSON.stringify(mealData)}`);
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  async generateMealPlan(
    days: number,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `Generate a ${days}-day meal plan optimized for:
- User's health goals: ${userContext.profile?.healthGoals?.join(', ') || 'General wellness'}
- Dietary restrictions: ${userContext.profile?.dietaryRestrictions?.join(', ') || 'None'}
- Polyphenol target: 1,500mg+ daily
- Macronutrient balance
- Meal timing for optimal metabolism

Include:
- Specific recipes or meal suggestions
- Polyphenol sources in each meal
- Portion sizes
- Meal timing recommendations
- Grocery list`;

    const response = await this.callOpenAI(systemPrompt, `Generate a ${days}-day personalized meal plan.`);
    
    return {
      response: response,
      actionItems: this.extractActionItems(response),
    };
  }

  async optimizePolyphenols(
    currentIntake: number,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const target = 1500; // mg per day
    const gap = target - currentIntake;

    const systemPrompt = `The user is currently consuming ${currentIntake}mg of polyphenols daily. Target is 1,500mg+ daily.

Provide specific, actionable recommendations to increase polyphenol intake by ${gap}mg daily. Focus on:
- High-polyphenol foods (berries, dark chocolate, green tea, olive oil, nuts, ancient grains)
- Meal ideas incorporating polyphenol-rich ingredients
- Practical ways to add polyphenols to existing meals`;

    const response = await this.callOpenAI(systemPrompt, 'How can I increase my daily polyphenol intake?');
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  private buildUserContext(context: UserHealthContext): string {
    let ctx = '';
    if (context.profile) {
      ctx += `Age: ${context.profile.age || 'Not specified'}\n`;
      ctx += `Health Goals: ${context.profile.healthGoals?.join(', ') || 'General wellness'}\n`;
      ctx += `Dietary Restrictions: ${context.profile.dietaryRestrictions?.join(', ') || 'None'}\n`;
      ctx += `Activity Level: ${context.profile.activityLevel || 'Not specified'}\n`;
    }
    return ctx;
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
      return completion.choices[0]?.message?.content || 'Unable to generate response.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AI Coach error: ${errorMessage}`);
    }
  }

  private extractRecommendations(response: string): string[] {
    // Extract bullet points or numbered recommendations
    const recommendations: string[] = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
        recommendations.push(line.replace(/^[-•*\d.]\s+/, '').trim());
      }
    }
    return recommendations.slice(0, 5); // Top 5
  }

  private extractActionItems(response: string): Array<{ task: string; priority: 'high' | 'medium' | 'low' }> {
    const actionItems: Array<{ task: string; priority: 'high' | 'medium' | 'low' }> = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('action') || line.match(/^[-•*]\s/)) {
        actionItems.push({
          task: line.replace(/^[-•*]\s+/, '').trim(),
          priority: line.toLowerCase().includes('important') || line.toLowerCase().includes('urgent') ? 'high' : 'medium',
        });
      }
    }
    return actionItems.slice(0, 3);
  }
}

export class FitnessMovementModule {
  async generateWorkoutPlan(
    goals: string[],
    userContext: UserHealthContext,
    daysPerWeek: number = 4
  ): Promise<CoachingResponse> {
    const systemPrompt = `You are a fitness and movement specialist specializing in:
- Longevity-focused exercise protocols
- Strength training for metabolic health
- Cardiovascular optimization
- Flexibility and mobility
- Injury prevention
- VO2 max improvement
- Recovery protocols

User Context:
- Health Goals: ${goals.join(', ')}
- Activity Level: ${userContext.profile?.activityLevel || 'moderate'}
- Age: ${userContext.profile?.age || 'Not specified'}

Generate a ${daysPerWeek}-day workout plan that includes:
- Specific exercises with sets, reps, and rest periods
- Warm-up and cool-down routines
- Progressive overload strategy
- Longevity-focused protocols (zone 2 cardio, strength training)
- Recovery recommendations`;

    const response = await this.callOpenAI(systemPrompt, `Create a ${daysPerWeek}-day workout plan for me.`);
    
    return {
      response: response,
      actionItems: this.extractActionItems(response),
    };
  }

  async analyzeForm(
    exerciseName: string,
    videoOrDescription: string,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `You are an exercise form correction specialist. Analyze the provided exercise form and provide:
- Specific corrections needed
- Common mistakes to avoid
- Cues to improve form
- Injury prevention tips
- Alternative exercises if form cannot be corrected`;

    const response = await this.callOpenAI(
      systemPrompt,
      `Analyze my ${exerciseName} form: ${videoOrDescription}`
    );
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  async createRecoveryProtocol(
    workoutType: string,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `Create a comprehensive recovery protocol after ${workoutType} that includes:
- Active recovery exercises
- Stretching and mobility work
- Nutrition timing
- Sleep recommendations
- Supplement suggestions (evidence-based)
- Timeline for full recovery`;

    const response = await this.callOpenAI(systemPrompt, `Design a recovery protocol for ${workoutType}.`);
    
    return {
      response: response,
      actionItems: this.extractActionItems(response),
    };
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
      return completion.choices[0]?.message?.content || 'Unable to generate response.';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AI Coach error: ${errorMessage}`);
    }
  }

  private extractRecommendations(response: string): string[] {
    const recommendations: string[] = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
        recommendations.push(line.replace(/^[-•*\d.]\s+/, '').trim());
      }
    }
    return recommendations.slice(0, 5);
  }

  private extractActionItems(response: string): Array<{ task: string; priority: 'high' | 'medium' | 'low' }> {
    const actionItems: Array<{ task: string; priority: 'high' | 'medium' | 'low' }> = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/)) {
        actionItems.push({
          task: line.replace(/^[-•*]\s+/, '').trim(),
          priority: 'medium',
        });
      }
    }
    return actionItems.slice(0, 5);
  }
}

export class SleepOptimizationModule {
  async designBedtimeRoutine(
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const sleepBiomarker = userContext.biomarkers?.find((d: unknown) => {
      const biomarker = d as { metric?: string; value?: unknown };
      return biomarker.metric === 'sleep';
    }) as { metric?: string; value?: unknown } | undefined;
    const systemPrompt = `You are a sleep optimization specialist. Design a personalized bedtime routine considering:
- User's current sleep patterns: ${sleepBiomarker?.value || 'Not tracked'}
- Sleep goals: ${userContext.profile?.healthGoals?.includes('sleep') ? 'Optimize sleep' : 'General sleep improvement'}
- Lifestyle factors

Include:
- Pre-sleep activities (2-3 hours before bed)
- Light exposure timing
- Temperature optimization
- Supplement stack (magnesium, glycine, etc.) with dosages
- Breathwork or relaxation techniques
- Digital detox timing`;

    const response = await this.callOpenAI(systemPrompt, 'Design a personalized bedtime routine for optimal sleep.');
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  async optimizeSleepEnvironment(
    currentConditions: SleepConditions,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `Optimize the sleep environment for ideal conditions:
- Temperature: Target 65-68°F (18-20°C)
- Light: Complete darkness or eye mask
- Sound: White noise or silence preference
- Air quality: Ventilation recommendations
- Bedding: Recommendations for temperature regulation`;

    const response = await this.callOpenAI(
      systemPrompt,
      `Optimize my sleep environment. Current: ${JSON.stringify(currentConditions)}`
    );
    
    return {
      response: response,
      actionItems: this.extractActionItems(response),
    };
  }

  async recommendSleepSupplements(
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `Recommend evidence-based sleep supplements based on user's needs. Include:
- Magnesium (form and dosage)
- Glycine
- Melatonin (only if needed, with timing)
- L-theanine
- Apigenin
- Other research-backed supplements

Consider:
- User's current medications: ${userContext.profile?.allergies || 'None specified'}
- Timing of administration
- Potential interactions
- Evidence strength for each supplement`;

    const response = await this.callOpenAI(systemPrompt, 'What supplements can help improve my sleep?');
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
      return completion.choices[0]?.message?.content || 'Unable to generate response.';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AI Coach error: ${errorMessage}`);
    }
  }

  private extractRecommendations(response: string): string[] {
    const recommendations: string[] = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
        recommendations.push(line.replace(/^[-•*\d.]\s+/, '').trim());
      }
    }
    return recommendations.slice(0, 5);
  }

  private extractActionItems(response: string): Array<{ task: string; priority: 'high' | 'medium' | 'low' }> {
    const actionItems: Array<{ task: string; priority: 'high' | 'medium' | 'low' }> = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/)) {
        actionItems.push({
          task: line.replace(/^[-•*]\s+/, '').trim(),
          priority: 'medium',
        });
      }
    }
    return actionItems.slice(0, 5);
  }
}

export class StressMentalWellnessModule {
  async provideCBTTechniques(
    situation: string,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `You are a mental wellness coach specializing in Cognitive Behavioral Therapy (CBT). Provide CBT techniques for managing stress and anxiety.

Use evidence-based CBT approaches:
- Cognitive restructuring
- Thought challenging
- Behavioral activation
- Exposure techniques (if appropriate)
- Mindfulness-based CBT

Make it practical and actionable.`;

    const response = await this.callOpenAI(
      systemPrompt,
      `I'm dealing with this situation: ${situation}. What CBT techniques can help?`
    );
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  async designBreathworkProtocol(
    goal: 'stress_reduction' | 'energy_boost' | 'sleep' | 'focus',
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `Design a breathwork protocol for ${goal}. Include:
- Specific breathing patterns (box breathing, 4-7-8, Wim Hof, etc.)
- Timing and duration
- Frequency recommendations
- Expected benefits
- Safety considerations`;

    const response = await this.callOpenAI(systemPrompt, `Create a breathwork protocol for ${goal}.`);
    
    return {
      response: response,
      actionItems: this.extractActionItems(response),
    };
  }

  async interpretStressBiomarkers(
    biomarkers: StressBiomarkers,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `Interpret stress-related biomarkers including:
- Cortisol levels (circadian rhythm)
- HRV (Heart Rate Variability)
- Heart rate patterns
- Sleep quality indicators
- Inflammation markers (CRP)

Provide:
- What the biomarkers indicate about stress levels
- Specific interventions to reduce stress
- Timeline for improvement
- Monitoring recommendations`;

    const response = await this.callOpenAI(
      systemPrompt,
      `Interpret my stress biomarkers: ${JSON.stringify(biomarkers)}`
    );
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
      return completion.choices[0]?.message?.content || 'Unable to generate response.';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AI Coach error: ${errorMessage}`);
    }
  }

  private extractRecommendations(response: string): string[] {
    const recommendations: string[] = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
        recommendations.push(line.replace(/^[-•*\d.]\s+/, '').trim());
      }
    }
    return recommendations.slice(0, 5);
  }

  private extractActionItems(response: string): Array<{ task: string; priority: 'high' | 'medium' | 'low' }> {
    const actionItems: Array<{ task: string; priority: 'high' | 'medium' | 'low' }> = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/)) {
        actionItems.push({
          task: line.replace(/^[-•*]\s+/, '').trim(),
          priority: 'medium',
        });
      }
    }
    return actionItems.slice(0, 5);
  }
}

export class LongevityAntiAgingModule {
  async reduceBiologicalAge(
    currentAge: number,
    biologicalAge: number,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const gap = biologicalAge - currentAge;
    const systemPrompt = `The user's biological age (${biologicalAge}) is ${gap > 0 ? gap : Math.abs(gap)} years ${gap > 0 ? 'older' : 'younger'} than their chronological age (${currentAge}).

You are a longevity specialist. Provide a comprehensive plan to reduce biological age, including:
- Telomere health protocols
- NAD+ boosting strategies
- Senescent cell clearance (senolytics education)
- Epigenetic optimization (HDAC inhibition, methylation support)
- Mitochondrial health
- Hormone optimization
- Specific interventions with timelines`;

    const response = await this.callOpenAI(systemPrompt, 'How can I reduce my biological age?');
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
      actionItems: this.extractActionItems(response),
    };
  }

  async optimizeTelomereHealth(
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `You are a telomere health specialist. Provide evidence-based strategies to maintain and lengthen telomeres:

- Lifestyle interventions (exercise, sleep, stress management)
- Dietary strategies (polyphenols, antioxidants)
- Supplement recommendations (TA-65, astragalus, etc.)
- Research-backed protocols
- Testing recommendations`;

    const response = await this.callOpenAI(systemPrompt, 'How can I optimize my telomere health?');
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  async boostNADplus(
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `Provide comprehensive NAD+ boosting strategies:

- Precursor supplementation (NR, NMN, niacin)
- Lifestyle interventions (exercise, fasting)
- Foods that boost NAD+
- Timing and dosages
- Safety considerations
- Expected benefits`;

    const response = await this.callOpenAI(systemPrompt, 'How can I boost my NAD+ levels?');
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
      return completion.choices[0]?.message?.content || 'Unable to generate response.';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AI Coach error: ${errorMessage}`);
    }
  }

  private extractRecommendations(response: string): string[] {
    const recommendations: string[] = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
        recommendations.push(line.replace(/^[-•*\d.]\s+/, '').trim());
      }
    }
    return recommendations.slice(0, 5);
  }

  private extractActionItems(response: string): Array<{ task: string; priority: 'high' | 'medium' | 'low' }> {
    const actionItems: Array<{ task: string; priority: 'high' | 'medium' | 'low' }> = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/)) {
        actionItems.push({
          task: line.replace(/^[-•*]\s+/, '').trim(),
          priority: 'medium',
        });
      }
    }
    return actionItems.slice(0, 5);
  }
}

export class DiseasePreventionModule {
  async optimizeCardiovascularHealth(
    riskFactors: RiskFactors,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `You are a cardiovascular health optimization specialist. Based on risk factors, provide:

- Specific interventions to reduce heart disease risk
- Dietary modifications (DASH diet, Mediterranean diet principles)
- Exercise protocols (zone 2 cardio, strength training)
- Biomarker targets (ApoB, LDL, triglycerides, blood pressure)
- Supplement recommendations (omega-3, CoQ10, etc.)
- Monitoring schedule`;

    const response = await this.callOpenAI(
      systemPrompt,
      `Optimize my cardiovascular health. Risk factors: ${JSON.stringify(riskFactors)}`
    );
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  async preventDiabetes(
    riskFactors: RiskFactors,
    biomarkers: Biomarkers,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `Create a diabetes prevention/reversal protocol based on:
- Current biomarkers (glucose, HbA1c, insulin, HOMA-IR)
- Risk factors
- Lifestyle factors

Include:
- Dietary interventions (low glycemic, time-restricted eating)
- Exercise protocols
- Supplement recommendations (berberine, alpha-lipoic acid, etc.)
- Monitoring schedule
- Timeline for improvement`;

    const response = await this.callOpenAI(
      systemPrompt,
      `How can I prevent or reverse diabetes? My biomarkers: ${JSON.stringify(biomarkers)}`
    );
    
    return {
      response: response,
      actionItems: this.extractActionItems(response),
    };
  }

  async reduceCancerRisk(
    riskFactors: RiskFactors,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `Provide evidence-based strategies to reduce cancer risk:

- Dietary modifications (plant-based, polyphenol-rich, anti-inflammatory)
- Lifestyle interventions (exercise, sleep, stress management)
- Environmental toxin avoidance
- Screening recommendations
- Supplement strategies (vitamin D, curcumin, etc.)
- Specific protocols for different cancer types if relevant`;

    const response = await this.callOpenAI(systemPrompt, 'How can I reduce my cancer risk?');
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
      return completion.choices[0]?.message?.content || 'Unable to generate response.';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AI Coach error: ${errorMessage}`);
    }
  }

  private extractRecommendations(response: string): string[] {
    const recommendations: string[] = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
        recommendations.push(line.replace(/^[-•*\d.]\s+/, '').trim());
      }
    }
    return recommendations.slice(0, 5);
  }

  private extractActionItems(response: string): Array<{ task: string; priority: 'high' | 'medium' | 'low' }> {
    const actionItems: Array<{ task: string; priority: 'high' | 'medium' | 'low' }> = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/)) {
        actionItems.push({
          task: line.replace(/^[-•*]\s+/, '').trim(),
          priority: 'medium',
        });
      }
    }
    return actionItems.slice(0, 5);
  }
}

export class BiomarkerInterpretationModule {
  async interpretLabResults(
    labResults: LabResults,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `You are a biomarker interpretation specialist. Explain lab results in plain language:

- Compare to optimal ranges (not just "normal")
- Explain what each marker means
- Identify concerning patterns
- Suggest specific interventions for out-of-range markers
- Predict future risk based on trajectory
- Timeline for improvement

Use this format:
**Marker Name**: Value (optimal range)
**What it means**: Explanation
**Your status**: Optimal/Suboptimal/Concerning
**Action items**: Specific interventions`;

    const response = await this.callOpenAI(
      systemPrompt,
      `Interpret these lab results: ${JSON.stringify(labResults)}`
    );
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
      actionItems: this.extractActionItems(response),
    };
  }

  async explainMarker(
    markerName: string,
    value: number,
    unit: string,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `Explain the biomarker ${markerName} in detail:
- What it measures
- Optimal ranges (not just normal)
- What your value (${value} ${unit}) means
- Factors that influence it
- How to optimize it
- Timeline for improvement`;

    const response = await this.callOpenAI(
      systemPrompt,
      `Explain ${markerName}: ${value} ${unit}`
    );
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  async trackTrends(
    markerName: string,
    historicalValues: Array<{ date: string; value: number }>,
    userContext: UserHealthContext
  ): Promise<CoachingResponse> {
    const systemPrompt = `Analyze the trend for ${markerName} over time:
- Identify the trend direction (improving, declining, stable)
- Rate of change
- Predict future trajectory if current trend continues
- Risk assessment based on trajectory
- Specific interventions to reverse negative trends`;

    const response = await this.callOpenAI(
      systemPrompt,
      `Analyze trend for ${markerName}: ${JSON.stringify(historicalValues)}`
    );
    
    return {
      response: response,
      recommendations: this.extractRecommendations(response),
    };
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
      return completion.choices[0]?.message?.content || 'Unable to generate response.';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AI Coach error: ${errorMessage}`);
    }
  }

  private extractRecommendations(response: string): string[] {
    const recommendations: string[] = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
        recommendations.push(line.replace(/^[-•*\d.]\s+/, '').trim());
      }
    }
    return recommendations.slice(0, 5);
  }

  private extractActionItems(response: string): Array<{ task: string; priority: 'high' | 'medium' | 'low' }> {
    const actionItems: Array<{ task: string; priority: 'high' | 'medium' | 'low' }> = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s/)) {
        actionItems.push({
          task: line.replace(/^[-•*]\s+/, '').trim(),
          priority: 'medium',
        });
      }
    }
    return actionItems.slice(0, 5);
  }
}

