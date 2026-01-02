'use server';

// Centralized wellness plan generation logic for Phase 8
// NOTE: We intentionally keep types loose (any) to avoid tight coupling
// with Prisma output types and keep this usable from API routes.

export interface WellnessPlanContext {
  assessment: Record<string, unknown>;
  healthScore?: Record<string, unknown>;
  profile?: Record<string, unknown>;
  biomarkerTrend?: {
    weightTrend?: 'up' | 'down' | 'stable';
    avgSleepHours?: number | null;
  };
  habitsSummary?: {
    avgSteps?: number | null;
    avgMeditationMinutes?: number | null;
    avgWaterIntake?: number | null;
  };
  reason?: 'initial' | 'adjustment';
}

export function buildWellnessPlan(context: WellnessPlanContext) {
  const { assessment, healthScore, profile, biomarkerTrend, habitsSummary, reason = 'initial' } =
    context;

  const goals: string[] = [];
  const recommendations: string[] = [];

  // Determine goals based on assessment + trends
  const riskScore = (assessment as { overallRiskScore?: number })?.overallRiskScore;
  if (riskScore && riskScore > 50) {
    goals.push('Reduce cardiometabolic risk');
    recommendations.push('Focus on lifestyle modifications and regular biomarker tracking.');
  }

  const exerciseFreq = (assessment as { exerciseFrequency?: string })?.exerciseFrequency;
  if (exerciseFreq === 'rarely' || exerciseFreq === 'never') {
    goals.push('Increase structured physical activity');
    recommendations.push('Start with 30 minutes of moderate exercise 3x per week.');
  }

  const sleepHours = (assessment as { sleepHours?: number })?.sleepHours;
  if (sleepHours && sleepHours < 7) {
    goals.push('Improve sleep quality and duration');
    recommendations.push('Aim for 7-9 hours of quality sleep per night.');
  }

  const stressLevel = (assessment as { stressLevel?: number })?.stressLevel;
  if (stressLevel && stressLevel > 7) {
    goals.push('Reduce chronic stress load');
    recommendations.push('Implement daily stress management techniques.');
  }

  const foodGroups = (assessment as { foodGroups?: string[] })?.foodGroups;
  if (foodGroups && foodGroups.length < 4) {
    goals.push('Diversify nutrient intake');
    recommendations.push('Include more whole foods and varied food groups in your diet.');
  }

  if (biomarkerTrend?.weightTrend === 'up') {
    goals.push('Weight normalization');
    recommendations.push('Introduce a slight caloric deficit and consistent activity.');
  } else if (biomarkerTrend?.weightTrend === 'down') {
    recommendations.push('Ensure adequate protein and resistance training to preserve muscle.');
  }

  // Fall back goal if nothing else triggered
  if (goals.length === 0) {
    goals.push('Maintain current health status');
    recommendations.push('Continue current routine with minor optimizations.');
  }

  // Calorie target based on simple activity profile
  const baseCalories =
    profile?.activityLevel === 'very_active'
      ? 2500
      : profile?.activityLevel === 'active'
      ? 2200
      : profile?.activityLevel === 'moderate'
      ? 2000
      : 1800;

  const calorieTarget = baseCalories;
  const proteinTarget = Math.round((baseCalories * 0.15) / 4); // 15% from protein
  const carbTarget = Math.round((baseCalories * 0.5) / 4); // 50% from carbs
  const fatTarget = Math.round((baseCalories * 0.3) / 9); // 30% from fats

  // Exercise plan
  const exercisePlan = {
    frequency:
      exerciseFreq === 'rarely' || exerciseFreq === 'never'
        ? '3x per week'
        : exerciseFreq === 'weekly'
        ? '4-5x per week'
        : 'Daily',
    type:
      (assessment as { exerciseType?: string[] })?.exerciseType && (assessment as { exerciseType?: string[] }).exerciseType!.length > 0
        ? (assessment as { exerciseType?: string[] }).exerciseType!
        : ['Walking', 'Strength Training'],
    duration: 30,
  };

  // Sleep target – nudge towards 8h where needed
  const sleepTarget =
    biomarkerTrend?.avgSleepHours && biomarkerTrend.avgSleepHours < 7
      ? 8
      : sleepHours && sleepHours < 7
      ? 8
      : sleepHours || 8;

  // Stress management
  const stressManagement = [
    '10 minutes of meditation daily',
    'Deep breathing exercises (3x daily)',
    'Regular movement breaks every 60–90 minutes',
  ];

  // Weekly tasks tailored from above data
  const weeklyTasks = generateWeeklyTasks(goals, exercisePlan, sleepTarget, habitsSummary);

  // Meal & supplement suggestions
  const mealSuggestions = generateMealSuggestions(assessment);
  const supplementSuggestions = generateSupplementSuggestions(assessment);

  const planName =
    reason === 'adjustment' ? 'Adjusted Wellness Plan (Based on Latest Progress)' : 'Personalized Wellness Plan';

  const descriptionBase = `Customized plan based on your health assessment${
    reason === 'adjustment' ? ' and recent progress data' : ''
  }. Focus areas: ${goals.join(', ')}.`;

  const descriptionExtra =
    habitsSummary && (habitsSummary.avgSteps || habitsSummary.avgMeditationMinutes)
      ? ' Plan also reflects your average steps and recovery habits from the last 30 days.'
      : '';

  return {
    name: planName,
    description: descriptionBase + descriptionExtra,
    goals,
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    calorieTarget,
    proteinTarget,
    carbTarget,
    fatTarget,
    mealSuggestions,
    exercisePlan,
    sleepTarget,
    stressManagement,
    supplementSuggestions,
    weeklyTasks,
    isActive: true,
    startDate: new Date(),
  };
}

function generateWeeklyTasks(
  goals: string[],
  exercisePlan: Record<string, unknown>,
  sleepTarget: number,
  habitsSummary?: WellnessPlanContext['habitsSummary'],
) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return days.map((day, index) => {
    const tasks: unknown[] = [];

    // Exercise tasks
    if (
      (exercisePlan.frequency as string).includes('Daily') ||
      ((exercisePlan.frequency as string).includes('3x') && [0, 2, 4].includes(index)) ||
      ((exercisePlan.frequency as string).includes('4-5x') && index < 5)
    ) {
      tasks.push({
        title: `Exercise: ${((exercisePlan.type as string[])[0] || 'Walking')}`,
        description: `${exercisePlan.duration} minutes`,
        completed: false,
      });
    }

    // Sleep tracking
    tasks.push({
      title: `Sleep ${sleepTarget} hours`,
      description: 'Track your sleep duration and quality.',
      completed: false,
    });

    // Nutrition
    if (index % 2 === 0) {
      tasks.push({
        title: 'Log all meals',
        description: 'Track your nutrition intake for better insights.',
        completed: false,
      });
    }

    // Water intake
    const waterTarget = habitsSummary?.avgWaterIntake && habitsSummary.avgWaterIntake > 2 ? 2.5 : 2;
    tasks.push({
      title: `Drink ${waterTarget}L water`,
      description: 'Stay hydrated throughout the day.',
      completed: false,
    });

    // Stress management (3x per week)
    if ([0, 2, 4].includes(index)) {
      tasks.push({
        title: '10 min meditation',
        description: 'Practice stress management and recovery.',
        completed: false,
      });
    }

    return {
      day,
      tasks,
    };
  });
}

function generateMealSuggestions(assessment: unknown) {
  const suggestions: unknown[] = [];

  // Breakfast suggestions
  suggestions.push({
    name: 'Protein-Rich Breakfast',
    description: 'Greek yogurt with berries and nuts.',
    calories: 350,
    protein: 25,
    carbs: 30,
    fats: 15,
  });

  suggestions.push({
    name: 'Whole Grain Oatmeal',
    description: 'Oatmeal with banana and almond butter.',
    calories: 400,
    protein: 12,
    carbs: 55,
    fats: 15,
  });

  // Lunch suggestions
  suggestions.push({
    name: 'Grilled Chicken Salad',
    description: 'Mixed greens with grilled chicken and olive oil dressing.',
    calories: 450,
    protein: 35,
    carbs: 20,
    fats: 25,
  });

  suggestions.push({
    name: 'Quinoa Bowl',
    description: 'Quinoa with vegetables and lean protein.',
    calories: 500,
    protein: 30,
    carbs: 60,
    fats: 15,
  });

  // Dinner suggestions
  suggestions.push({
    name: 'Baked Salmon',
    description: 'Salmon with sweet potato and broccoli.',
    calories: 550,
    protein: 40,
    carbs: 45,
    fats: 20,
  });

  suggestions.push({
    name: 'Lean Protein with Vegetables',
    description: 'Chicken or fish with mixed vegetables.',
    calories: 450,
    protein: 35,
    carbs: 30,
    fats: 18,
  });

  return suggestions;
}

function generateSupplementSuggestions(assessment: unknown): string[] {
  const suggestions: string[] = [];

  const assessmentTyped = assessment as { foodGroups?: string[]; stressLevel?: number };
  if (assessmentTyped.foodGroups && !assessmentTyped.foodGroups.includes('Dairy')) {
    suggestions.push('Consider Vitamin D and Calcium supplementation (discuss with your doctor).');
  }

  if (assessmentTyped.foodGroups && !assessmentTyped.foodGroups.includes('Nuts & Seeds')) {
    suggestions.push('Omega-3 fatty acids (from fish oil or algae) may be beneficial.');
  }

  if (assessmentTyped.stressLevel && assessmentTyped.stressLevel > 7) {
    suggestions.push('Magnesium glycinate may support stress management and sleep.');
  }

  return suggestions;
}


