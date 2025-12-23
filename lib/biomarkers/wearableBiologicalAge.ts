/**
 * Wearable-Based Biological Age Calculator
 * Calculates biological age from wearable data (HRV, sleep, activity, recovery)
 * 5 methods: HRV-based cardiac age, sleep quality age, activity age, recovery age, combined
 */

export interface HRVData {
  value: number; // ms
  date: Date;
}

export interface SleepData {
  duration: number; // hours
  efficiency: number; // percentage
  deepSleep: number; // hours
  remSleep: number; // hours
  date: Date;
}

export interface ActivityData {
  steps: number;
  activeMinutes: number;
  vo2Max?: number; // Estimated
  date: Date;
}

export interface RecoveryData {
  score: number; // 0-100
  hrvRecovery: number; // HRV recovery after training
  date: Date;
}

export interface BiologicalAgeFactors {
  cardiacAge: number;
  sleepAge: number;
  activityAge: number;
  recoveryAge: number;
  combinedAge: number;
  drivers: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

/**
 * Calculate HRV-based cardiac age
 * Uses HRV trends vs age-matched peers
 */
export function calculateCardiacAge(
  hrvData: HRVData[],
  chronologicalAge: number
): number {
  if (hrvData.length === 0) return chronologicalAge;

  // Calculate average HRV over last 30 days
  const recentHRV = hrvData
    .filter(d => {
      const daysAgo = (Date.now() - d.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    })
    .map(d => d.value);

  if (recentHRV.length === 0) return chronologicalAge;

  const avgHRV = recentHRV.reduce((a, b) => a + b, 0) / recentHRV.length;

  // Age-matched HRV norms (simplified - production would use research data)
  // HRV typically declines ~3-5ms per decade
  const ageNorms: Record<number, number> = {
    20: 60,
    30: 55,
    40: 50,
    50: 45,
    60: 40,
    70: 35,
  };

  // Find closest age norm
  const ageKeys = Object.keys(ageNorms).map(Number).sort((a, b) => a - b);
  let closestAge = ageKeys[0];
  for (const age of ageKeys) {
    if (Math.abs(age - chronologicalAge) < Math.abs(closestAge - chronologicalAge)) {
      closestAge = age;
    }
  }

  const normHRV = ageNorms[closestAge] || 50;

  // Calculate age adjustment based on HRV difference
  // Each 5ms difference ≈ 1 year of age difference
  const hrvDifference = avgHRV - normHRV;
  const ageAdjustment = hrvDifference / 5;

  return Math.max(20, Math.min(100, chronologicalAge - ageAdjustment));
}

/**
 * Calculate sleep quality age
 * Based on sleep efficiency, deep sleep %, REM %
 */
export function calculateSleepAge(
  sleepData: SleepData[],
  chronologicalAge: number
): number {
  if (sleepData.length === 0) return chronologicalAge;

  // Calculate averages over last 30 days
  const recentSleep = sleepData
    .filter(d => {
      const daysAgo = (Date.now() - d.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

  if (recentSleep.length === 0) return chronologicalAge;

  const avgEfficiency = recentSleep.reduce((sum, d) => sum + d.efficiency, 0) / recentSleep.length;
  const avgDeepSleep = recentSleep.reduce((sum, d) => sum + d.deepSleep, 0) / recentSleep.length;
  const avgRemSleep = recentSleep.reduce((sum, d) => sum + d.remSleep, 0) / recentSleep.length;
  const avgDuration = recentSleep.reduce((sum, d) => sum + d.duration, 0) / recentSleep.length;

  // Optimal sleep metrics
  const optimalEfficiency = 90; // 90%+
  const optimalDeepSleep = 2.5; // 2.5+ hours
  const optimalRemSleep = 1.5; // 1.5+ hours
  const optimalDuration = 8; // 8 hours

  // Calculate age adjustment
  // Each 10% efficiency difference ≈ 2 years
  // Each 0.5h deep sleep difference ≈ 1 year
  // Each 0.5h REM difference ≈ 1 year
  // Each 1h duration difference ≈ 1.5 years

  const efficiencyDiff = (avgEfficiency - optimalEfficiency) / 10;
  const deepSleepDiff = (avgDeepSleep - optimalDeepSleep) / 0.5;
  const remSleepDiff = (avgRemSleep - optimalRemSleep) / 0.5;
  const durationDiff = (avgDuration - optimalDuration) / 1;

  const ageAdjustment = (efficiencyDiff * 2 + deepSleepDiff + remSleepDiff + durationDiff * 1.5) / 4;

  return Math.max(20, Math.min(100, chronologicalAge - ageAdjustment));
}

/**
 * Calculate activity/movement age
 * Based on daily steps, activity consistency, VO2 max proxy
 */
export function calculateActivityAge(
  activityData: ActivityData[],
  chronologicalAge: number
): number {
  if (activityData.length === 0) return chronologicalAge;

  // Calculate averages over last 30 days
  const recentActivity = activityData
    .filter(d => {
      const daysAgo = (Date.now() - d.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

  if (recentActivity.length === 0) return chronologicalAge;

  const avgSteps = recentActivity.reduce((sum, d) => sum + d.steps, 0) / recentActivity.length;
  const avgActiveMinutes = recentActivity.reduce((sum, d) => sum + d.activeMinutes, 0) / recentActivity.length;
  
  // Calculate consistency (days with activity)
  const activeDays = recentActivity.filter(d => d.steps > 5000).length;
  const consistency = activeDays / recentActivity.length;

  // Optimal metrics
  const optimalSteps = 10000;
  const optimalActiveMinutes = 30;
  const optimalConsistency = 0.8; // 80% of days

  // Calculate age adjustment
  // Each 2000 steps difference ≈ 1 year
  // Each 10 min active difference ≈ 0.5 years
  // Each 10% consistency difference ≈ 1 year

  const stepsDiff = (avgSteps - optimalSteps) / 2000;
  const activeDiff = (avgActiveMinutes - optimalActiveMinutes) / 10;
  const consistencyDiff = (consistency - optimalConsistency) / 0.1;

  const ageAdjustment = (stepsDiff + activeDiff * 0.5 + consistencyDiff) / 2.5;

  return Math.max(20, Math.min(100, chronologicalAge - ageAdjustment));
}

/**
 * Calculate recovery age
 * Based on HRV recovery after training, adaptation speed
 */
export function calculateRecoveryAge(
  recoveryData: RecoveryData[],
  chronologicalAge: number
): number {
  if (recoveryData.length === 0) return chronologicalAge;

  // Calculate averages over last 30 days
  const recentRecovery = recoveryData
    .filter(d => {
      const daysAgo = (Date.now() - d.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

  if (recentRecovery.length === 0) return chronologicalAge;

  const avgRecoveryScore = recentRecovery.reduce((sum, d) => sum + d.score, 0) / recentRecovery.length;
  const avgHRVRecovery = recentRecovery.reduce((sum, d) => sum + d.hrvRecovery, 0) / recentRecovery.length;

  // Optimal recovery metrics
  const optimalRecoveryScore = 80; // 80+
  const optimalHRVRecovery = 5; // 5ms+ recovery

  // Calculate age adjustment
  // Each 10 point recovery difference ≈ 2 years
  // Each 1ms HRV recovery difference ≈ 1 year

  const recoveryDiff = (avgRecoveryScore - optimalRecoveryScore) / 10;
  const hrvRecoveryDiff = (avgHRVRecovery - optimalHRVRecovery) / 1;

  const ageAdjustment = (recoveryDiff * 2 + hrvRecoveryDiff) / 2;

  return Math.max(20, Math.min(100, chronologicalAge - ageAdjustment));
}

/**
 * Calculate combined biological age
 * Multi-factor aging index
 */
export function calculateCombinedBiologicalAge(
  cardiacAge: number,
  sleepAge: number,
  activityAge: number,
  recoveryAge: number,
  chronologicalAge: number
): { biologicalAge: number; factors: BiologicalAgeFactors } {
  // Weighted average (cardiac and sleep weighted higher)
  const weights = {
    cardiac: 0.3,
    sleep: 0.3,
    activity: 0.2,
    recovery: 0.2,
  };

  const combinedAge = 
    cardiacAge * weights.cardiac +
    sleepAge * weights.sleep +
    activityAge * weights.activity +
    recoveryAge * weights.recovery;

  // Identify primary drivers
  const ages = [
    { name: 'cardiac', value: cardiacAge },
    { name: 'sleep', value: sleepAge },
    { name: 'activity', value: activityAge },
    { name: 'recovery', value: recoveryAge },
  ].sort(
    // Sort by largest deviation from chronological age first
    (a, b) =>
      Math.abs(b.value - chronologicalAge) - Math.abs(a.value - chronologicalAge)
  );

  return {
    biologicalAge: Math.round(combinedAge * 10) / 10,
    factors: {
      cardiacAge: Math.round(cardiacAge * 10) / 10,
      sleepAge: Math.round(sleepAge * 10) / 10,
      activityAge: Math.round(activityAge * 10) / 10,
      recoveryAge: Math.round(recoveryAge * 10) / 10,
      combinedAge: Math.round(combinedAge * 10) / 10,
      drivers: {
        primary: ages[0]?.name || 'cardiac',
        secondary: ages[1]?.name || 'sleep',
        tertiary: ages[2]?.name || 'activity',
      },
    },
  };
}

/**
 * Main function: Calculate biological age from wearables
 */
export async function calculateWearableBiologicalAge(
  hrvData: HRVData[],
  sleepData: SleepData[],
  activityData: ActivityData[],
  recoveryData: RecoveryData[],
  chronologicalAge: number
): Promise<{ biologicalAge: number; factors: BiologicalAgeFactors }> {
  // Calculate each component age
  const cardiacAge = calculateCardiacAge(hrvData, chronologicalAge);
  const sleepAge = calculateSleepAge(sleepData, chronologicalAge);
  const activityAge = calculateActivityAge(activityData, chronologicalAge);
  const recoveryAge = calculateRecoveryAge(recoveryData, chronologicalAge);

  // Calculate combined age
  return calculateCombinedBiologicalAge(
    cardiacAge,
    sleepAge,
    activityAge,
    recoveryAge,
    chronologicalAge
  );
}
