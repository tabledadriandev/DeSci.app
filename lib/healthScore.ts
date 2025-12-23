/**
 * Transparent Health Score Calculation
 * 
 * Calculates health score with full breakdown of factors
 */

export interface HealthFactors {
  age: number;
  bmi: number;
  glucose: number;
  creatinine: number;
  sleepHours: number;
  exerciseHoursPerWeek: number;
  systolicBP?: number;
  diastolicBP?: number;
}

export interface HealthScoreBreakdown {
  totalScore: number;
  factors: Array<{
    name: string;
    weight: number;
    score: number;
    contribution: number;
    explanation: string;
  }>;
  biologicalAge: number;
  percentile: number;
}

/**
 * Calculate health score with transparent breakdown
 */
export function calculateHealthScore(factors: HealthFactors): HealthScoreBreakdown {
  // Age factor (0-25 points)
  const ageScore = Math.max(0, 100 - (factors.age - 20) * 2);
  const ageFactor = {
    name: 'Age',
    weight: 0.25,
    score: ageScore,
    explanation: `Age ${factors.age}: ${ageScore >= 80 ? 'Excellent' : ageScore >= 60 ? 'Good' : 'Fair'} for your age group`,
  };

  // BMI factor (0-20 points)
  const bmi = factors.bmi;
  let bmiScore = 0;
  let bmiExplanation = '';
  
  if (bmi >= 18.5 && bmi <= 25) {
    bmiScore = 100;
    bmiExplanation = `BMI ${bmi.toFixed(1)}: Optimal range (18.5-25)`;
  } else if (bmi >= 25 && bmi <= 30) {
    bmiScore = 70;
    bmiExplanation = `BMI ${bmi.toFixed(1)}: Overweight (25-30), consider weight management`;
  } else if (bmi < 18.5) {
    bmiScore = 60;
    bmiExplanation = `BMI ${bmi.toFixed(1)}: Underweight (<18.5), consider nutrition support`;
  } else {
    bmiScore = 30;
    bmiExplanation = `BMI ${bmi.toFixed(1)}: Obese (>30), prioritize weight reduction`;
  }

  const bmiFactor = {
    name: 'BMI',
    weight: 0.20,
    score: bmiScore,
    explanation: bmiExplanation,
  };

  // Glucose factor (0-20 points)
  const glucoseScore = factors.glucose < 100 
    ? 100 
    : Math.max(0, 100 - (factors.glucose - 100) * 0.5);
  const glucoseFactor = {
    name: 'Glucose',
    weight: 0.20,
    score: glucoseScore,
    explanation: `Fasting glucose ${factors.glucose} mg/dL: ${
      factors.glucose < 100 ? 'Normal' : factors.glucose < 126 ? 'Pre-diabetic range' : 'Diabetic range'
    }`,
  };

  // Sleep factor (0-15 points)
  const sleepScore = factors.sleepHours >= 7 && factors.sleepHours <= 9 
    ? 100 
    : factors.sleepHours >= 6 && factors.sleepHours <= 10 
    ? 70 
    : 40;
  const sleepFactor = {
    name: 'Sleep',
    weight: 0.15,
    score: sleepScore,
    explanation: `${factors.sleepHours}h/night: ${
      factors.sleepHours >= 7 && factors.sleepHours <= 9 
        ? 'Optimal (7-9h recommended)' 
        : 'Suboptimal, aim for 7-9 hours'
    }`,
  };

  // Exercise factor (0-20 points)
  const exerciseScore = factors.exerciseHoursPerWeek >= 5 
    ? 100 
    : Math.min(100, (factors.exerciseHoursPerWeek / 5) * 100);
  const exerciseFactor = {
    name: 'Exercise',
    weight: 0.20,
    score: exerciseScore,
    explanation: `${factors.exerciseHoursPerWeek}h/week: ${
      factors.exerciseHoursPerWeek >= 5 
        ? 'Meets WHO recommendations (5h/week)' 
        : 'Below recommendations, aim for 5+ hours/week'
    }`,
  };

  const factorsArray = [ageFactor, bmiFactor, glucoseFactor, sleepFactor, exerciseFactor];

  // Calculate total score
  const totalScore = factorsArray.reduce((sum, f) => {
    return sum + f.score * f.weight;
  }, 0);

  // Calculate biological age (simplified model)
  // Higher score = younger biological age
  const ageAdjustment = ((totalScore - 50) / 50) * 5;
  const biologicalAge = Math.max(0, Math.round(factors.age - ageAdjustment));

  // Calculate percentile (simplified - would use real population data)
  const percentile = Math.min(99, Math.max(1, Math.round(totalScore)));

  return {
    totalScore: Math.round(totalScore),
    factors: factorsArray.map((f) => ({
      ...f,
      contribution: Math.round(f.score * f.weight),
    })),
    biologicalAge,
    percentile,
  };
}

/**
 * Get health score interpretation
 */
export function interpretHealthScore(score: number): {
  level: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
  message: string;
} {
  if (score >= 85) {
    return {
      level: 'excellent',
      color: 'success',
      message: 'Excellent health! You\'re in the top tier.',
    };
  } else if (score >= 70) {
    return {
      level: 'good',
      color: 'info',
      message: 'Good health! Keep up the great work.',
    };
  } else if (score >= 55) {
    return {
      level: 'fair',
      color: 'warning',
      message: 'Fair health. There\'s room for improvement.',
    };
  } else {
    return {
      level: 'poor',
      color: 'error',
      message: 'Health needs attention. Consider lifestyle changes.',
    };
  }
}

