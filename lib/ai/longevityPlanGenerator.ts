/**
 * AI Longevity Plan Generator
 * Claude API integration for personalized protocols
 */

import Anthropic from '@anthropic-ai/sdk';

export interface UserData {
  age: number;
  gender: string;
  biologicalAge?: number;
  goals: string[];
  preferences: {
    dietary?: string[];
    exercise?: string[];
    timeCommitment?: number;
  };
}

export interface WearableData {
  hrv: number;
  sleepScore: number;
  recovery: number;
  activity: number;
}

export interface MedicalResult {
  biomarkers: Array<{
    name: string;
    value: number;
    status: 'optimal' | 'good' | 'suboptimal' | 'concerning';
  }>;
}

export interface MealLog {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  micronutrients?: any;
}

export interface LongevityPlan {
  nutrition: NutritionPlan;
  exercise: ExercisePlan;
  supplements: SupplementStack;
  sleep: SleepProtocol;
  stress: StressProtocol;
  expectedResults: ExpectedResults;
}

export interface NutritionPlan {
  dailyMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mealPlan: Array<{
    day: number;
    meals: Array<{
      type: string;
      foods: string[];
      calories: number;
    }>;
  }>;
  foodsToAvoid: string[];
  shoppingList: string[];
  mealTiming: {
    breakfast: string;
    lunch: string;
    dinner: string;
    fastingWindow?: number;
  };
}

export interface ExercisePlan {
  weeklySchedule: Array<{
    day: string;
    type: string;
    duration: number;
    intensity: string;
  }>;
  types: {
    cardio: { frequency: number; duration: number };
    strength: { frequency: number; duration: number };
    mobility: { frequency: number; duration: number };
  };
}

export interface SupplementStack {
  supplements: Array<{
    name: string;
    dosage: string;
    timing: string;
    benefits: string[];
  }>;
}

export interface SleepProtocol {
  idealBedtime: string;
  idealWakeTime: string;
  environment: {
    temperature: number;
    light: string;
    humidity: number;
  };
  preSleepRoutine: string[];
  foodsToAvoid: string[];
}

export interface StressProtocol {
  meditation: {
    type: string;
    duration: number;
    frequency: string;
  };
  breathwork: {
    type: string;
    duration: number;
    frequency: string;
  };
  other: string[];
}

export interface ExpectedResults {
  thirtyDays: string[];
  sixtyDays: string[];
  ninetyDays: string[];
  keyMetrics: string[];
}

export class LongevityPlanGenerator {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Generate comprehensive longevity plan
   */
  async generatePlan(
    userData: UserData,
    wearables: WearableData,
    medicalResults: MedicalResult[],
    foodLogs: MealLog[]
  ): Promise<LongevityPlan> {
    try {
      const prompt = this.buildPrompt(userData, wearables, medicalResults, foodLogs);

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response format');
      }

      // Parse JSON response
      const plan = JSON.parse(content.text);

      return plan;
    } catch (error: any) {
      console.error('Longevity plan generation error:', error);
      throw new Error(`Failed to generate plan: ${error.message}`);
    }
  }

  /**
   * Build prompt for Claude
   */
  private buildPrompt(
    userData: UserData,
    wearables: WearableData,
    medicalResults: MedicalResult[],
    foodLogs: MealLog[]
  ): string {
    return `You are a longevity expert AI. Generate a comprehensive 30-day personalized longevity plan based on the following data:

USER PROFILE:
- Age: ${userData.age}
- Gender: ${userData.gender}
- Biological Age: ${userData.biologicalAge || 'Not calculated'}
- Goals: ${userData.goals.join(', ')}
- Preferences: ${JSON.stringify(userData.preferences)}

WEARABLE DATA:
- HRV: ${wearables.hrv}ms
- Sleep Score: ${wearables.sleepScore}/100
- Recovery: ${wearables.recovery}%
- Activity: ${wearables.activity} minutes/day

MEDICAL RESULTS:
${medicalResults.map(r => 
  r.biomarkers.map(b => `- ${b.name}: ${b.value} (${b.status})`).join('\n')
).join('\n')}

FOOD LOGS (Last 7 days):
- Average Calories: ${foodLogs.reduce((sum, log) => sum + log.calories, 0) / foodLogs.length}
- Average Protein: ${foodLogs.reduce((sum, log) => sum + log.protein, 0) / foodLogs.length}g
- Average Carbs: ${foodLogs.reduce((sum, log) => sum + log.carbs, 0) / foodLogs.length}g
- Average Fat: ${foodLogs.reduce((sum, log) => sum + log.fat, 0) / foodLogs.length}g

Generate a comprehensive 30-day longevity plan with:
1. NUTRITION PLAN:
   - Daily macro targets (calories, protein, carbs, fat)
   - 30-day meal plan (breakfast, lunch, dinner, snacks)
   - Foods to avoid
   - Shopping list organized by impact
   - Meal timing (circadian optimization)

2. EXERCISE PLAN:
   - Weekly schedule (type, frequency, duration, intensity)
   - Cardio, strength, mobility recommendations
   - Based on recovery scores

3. SUPPLEMENT STACK:
   - Specific recommendations based on deficiencies
   - Dosages (age/weight adjusted)
   - Timing (morning/with food/bedtime)
   - Expected benefits

4. SLEEP PROTOCOL:
   - Ideal sleep/wake times
   - Environment (temp, light, humidity)
   - Pre-sleep routine
   - Foods to avoid before bed

5. STRESS MANAGEMENT:
   - Daily meditation/breathwork (duration, type)
   - Other practices (cold/heat, yoga, etc.)

6. EXPECTED RESULTS:
   - 30-day improvements
   - 60-day improvements
   - 90-day improvements
   - Key metrics to track

Return as JSON matching this structure:
{
  "nutrition": { ... },
  "exercise": { ... },
  "supplements": { ... },
  "sleep": { ... },
  "stress": { ... },
  "expectedResults": { ... }
}`;
  }

  /**
   * Generate nutrition plan only
   */
  async generateNutritionPlan(biomarkers: any): Promise<NutritionPlan> {
    // Simplified version - would use Claude API
    return {
      dailyMacros: {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 65,
      },
      mealPlan: [],
      foodsToAvoid: [],
      shoppingList: [],
      mealTiming: {
        breakfast: '7:00 AM',
        lunch: '12:00 PM',
        dinner: '6:00 PM',
      },
    };
  }

  /**
   * Generate exercise plan only
   */
  async generateExercisePlan(recovery: number): Promise<ExercisePlan> {
    return {
      weeklySchedule: [],
      types: {
        cardio: { frequency: 3, duration: 30 },
        strength: { frequency: 2, duration: 45 },
        mobility: { frequency: 5, duration: 15 },
      },
    };
  }

  /**
   * Generate supplement stack
   */
  async generateSupplementStack(deficiencies: any[]): Promise<SupplementStack> {
    return {
      supplements: [],
    };
  }

  /**
   * Generate sleep protocol
   */
  async generateSleepProtocol(sleepData: any): Promise<SleepProtocol> {
    return {
      idealBedtime: '10:00 PM',
      idealWakeTime: '6:00 AM',
      environment: {
        temperature: 65,
        light: 'Dark',
        humidity: 50,
      },
      preSleepRoutine: [],
      foodsToAvoid: [],
    };
  }

  /**
   * Generate stress management protocol
   */
  async generateStressManagement(hrv: number): Promise<StressProtocol> {
    return {
      meditation: {
        type: 'Mindfulness',
        duration: 10,
        frequency: 'Daily',
      },
      breathwork: {
        type: 'Box Breathing',
        duration: 5,
        frequency: 'Daily',
      },
      other: [],
    };
  }
}

export const createLongevityPlanGenerator = (apiKey: string) => 
  new LongevityPlanGenerator(apiKey);
