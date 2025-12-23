/**
 * Advanced Wellness Metrics
 * HRV Coherence, Sleep Debt, Parasympathetic Tone, Training Responsiveness,
 * Mitochondrial Proxy, Circadian Robustness, Longevity Score
 */

export interface HRVData {
  value: number; // ms
  date: Date;
}

export interface SleepData {
  duration: number; // hours
  date: Date;
}

export interface TrainingData {
  load: number; // Training load/volume
  date: Date;
}

export interface SleepSchedule {
  bedtime: Date;
  wakeTime: Date;
  date: Date;
}

/**
 * Calculate HRV Coherence
 * Heart-brain synchronization score
 */
export function calculateHRVCoherence(hrvReadings: number[]): number {
  if (hrvReadings.length < 7) return 0;

  // Calculate coefficient of variation (CV) - lower CV = higher coherence
  const mean = hrvReadings.reduce((a, b) => a + b, 0) / hrvReadings.length;
  const variance = hrvReadings.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / hrvReadings.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  // Convert CV to coherence score (0-100)
  // Lower CV = higher coherence
  // Typical CV for good coherence: 0.05-0.15
  const coherence = Math.max(0, Math.min(100, 100 - (cv * 500)));

  return Math.round(coherence * 10) / 10;
}

/**
 * Calculate Sleep Debt
 * Cumulative sleep deficit in hours
 */
export function calculateSleepDebt(
  sleepHistory: SleepData[],
  targetHours: number = 8
): number {
  if (sleepHistory.length === 0) return 0;

  // Calculate debt over last 14 days
  const recentSleep = sleepHistory
    .filter(s => {
      const daysAgo = (Date.now() - s.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 14;
    });

  if (recentSleep.length === 0) return 0;

  let totalDebt = 0;
  for (const sleep of recentSleep) {
    const deficit = targetHours - sleep.duration;
    if (deficit > 0) {
      totalDebt += deficit;
    }
  }

  return Math.round(totalDebt * 10) / 10;
}

/**
 * Calculate Parasympathetic Tone
 * Vagal strength measurement from HRV patterns
 */
export function calculateParasympatheticTone(hrvData: HRVData[]): number {
  if (hrvData.length < 7) return 0;

  // Calculate RMSSD (root mean square of successive differences)
  // Higher RMSSD = stronger parasympathetic tone
  const values = hrvData.map(d => d.value);
  const differences: number[] = [];
  
  for (let i = 1; i < values.length; i++) {
    differences.push(Math.pow(values[i] - values[i - 1], 2));
  }

  const rmssd = Math.sqrt(differences.reduce((a, b) => a + b, 0) / differences.length);

  // Convert RMSSD to tone score (0-100)
  // Typical RMSSD: 20-60ms for healthy adults
  // Higher = better parasympathetic tone
  const tone = Math.min(100, (rmssd / 60) * 100);

  return Math.round(tone * 10) / 10;
}

/**
 * Calculate Training Responsiveness
 * How well body adapts to training
 */
export function calculateTrainingResponsiveness(
  trainingLoad: number[],
  hrvRecovery: number[]
): number {
  if (trainingLoad.length < 7 || hrvRecovery.length < 7) return 0;

  // Calculate correlation between training load and HRV recovery
  // Positive correlation = good responsiveness
  // Negative correlation = poor adaptation

  const meanLoad = trainingLoad.reduce((a, b) => a + b, 0) / trainingLoad.length;
  const meanHRV = hrvRecovery.reduce((a, b) => a + b, 0) / hrvRecovery.length;

  let covariance = 0;
  let loadVariance = 0;
  let hrvVariance = 0;

  for (let i = 0; i < Math.min(trainingLoad.length, hrvRecovery.length); i++) {
    const loadDiff = trainingLoad[i] - meanLoad;
    const hrvDiff = hrvRecovery[i] - meanHRV;
    covariance += loadDiff * hrvDiff;
    loadVariance += loadDiff * loadDiff;
    hrvVariance += hrvDiff * hrvDiff;
  }

  const correlation = covariance / Math.sqrt(loadVariance * hrvVariance);

  // Convert correlation to responsiveness score (0-100)
  // Positive correlation = good responsiveness
  const responsiveness = Math.max(0, Math.min(100, (correlation + 1) * 50));

  return Math.round(responsiveness * 10) / 10;
}

/**
 * Calculate Mitochondrial Function Proxy
 * Estimated from recovery speed after training
 */
export function calculateMitochondrialProxy(recoverySpeed: number[]): number {
  if (recoverySpeed.length < 7) return 0;

  // Faster recovery = healthier mitochondria
  // Recovery speed measured as HRV return to baseline after training
  const avgRecoverySpeed = recoverySpeed.reduce((a, b) => a + b, 0) / recoverySpeed.length;

  // Convert to mitochondrial health score (0-100)
  // Typical recovery: 1-3 days
  // Faster = better mitochondrial function
  const mitochondrialHealth = Math.min(100, (1 / avgRecoverySpeed) * 100);

  return Math.round(mitochondrialHealth * 10) / 10;
}

/**
 * Calculate Circadian Robustness
 * Sleep quality despite schedule shifts
 */
export function calculateCircadianRobustness(sleepSchedule: SleepSchedule[]): number {
  if (sleepSchedule.length < 7) return 0;

  // Calculate variability in bedtime and wake time
  const bedtimes = sleepSchedule.map(s => s.bedtime.getHours() * 60 + s.bedtime.getMinutes());
  const wakeTimes = sleepSchedule.map(s => s.wakeTime.getHours() * 60 + s.wakeTime.getMinutes());

  const meanBedtime = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
  const meanWakeTime = wakeTimes.reduce((a, b) => a + b, 0) / wakeTimes.length;

  const bedtimeVariance = bedtimes.reduce((sum, bt) => sum + Math.pow(bt - meanBedtime, 2), 0) / bedtimes.length;
  const wakeTimeVariance = wakeTimes.reduce((sum, wt) => sum + Math.pow(wt - meanWakeTime, 2), 0) / wakeTimes.length;

  const bedtimeStdDev = Math.sqrt(bedtimeVariance);
  const wakeTimeStdDev = Math.sqrt(wakeTimeVariance);

  // Lower variability = higher robustness
  // Typical good robustness: <30 minutes variability
  const robustness = Math.max(0, Math.min(100, 100 - ((bedtimeStdDev + wakeTimeStdDev) / 2) * 2));

  return Math.round(robustness * 10) / 10;
}

/**
 * Calculate Longevity Score
 * Multi-factor aging index
 */
export function calculateLongevityScore(
  hrv: number,
  sleep: number,
  activity: number,
  recovery: number,
  stress: number
): { score: number; trajectory: string; prediction: string } {
  // Normalize inputs to 0-100 scale
  const normalizedHRV = Math.min(100, (hrv / 60) * 100); // Assuming 60ms is excellent
  const normalizedSleep = sleep; // Already 0-100
  const normalizedActivity = activity; // Already 0-100
  const normalizedRecovery = recovery; // Already 0-100
  const normalizedStress = 100 - stress; // Invert stress (lower stress = better)

  // Weighted average
  const weights = {
    hrv: 0.25,
    sleep: 0.25,
    activity: 0.20,
    recovery: 0.20,
    stress: 0.10,
  };

  const score = 
    normalizedHRV * weights.hrv +
    normalizedSleep * weights.sleep +
    normalizedActivity * weights.activity +
    normalizedRecovery * weights.recovery +
    normalizedStress * weights.stress;

  // Determine trajectory
  let trajectory: string;
  if (score >= 80) {
    trajectory = 'EXCELLENT';
  } else if (score >= 65) {
    trajectory = 'GOOD';
  } else if (score >= 50) {
    trajectory = 'MODERATE';
  } else {
    trajectory = 'NEEDS_IMPROVEMENT';
  }

  // Generate prediction
  let prediction: string;
  if (score >= 80) {
    prediction = 'You\'re aging at 70% speed—on track to live 95+';
  } else if (score >= 65) {
    prediction = 'You\'re aging at 85% speed—on track to live 85-90';
  } else if (score >= 50) {
    prediction = 'You\'re aging at 95% speed—focus on key interventions';
  } else {
    prediction = 'You\'re aging at 110% speed—prioritize health optimization';
  }

  return {
    score: Math.round(score * 10) / 10,
    trajectory,
    prediction,
  };
}
