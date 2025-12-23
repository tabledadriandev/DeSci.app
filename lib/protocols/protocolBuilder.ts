/**
 * Biohacking Protocol Builder
 * Creates 30-day experiments and tracks correlations with biomarkers
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProtocolInput {
  userId: string;
  name: string;
  goal: string; // "improve_sleep", "boost_hrv", "lose_weight", etc.
  currentState: {
    hrv?: number;
    sleepScore?: number;
    recovery?: number;
    activity?: number;
  };
  availableTime: number; // minutes per day
  preferences: {
    food?: string[];
    exercises?: string[];
    supplements?: string[];
    timeOfDay?: string[]; // "morning", "afternoon", "evening"
  };
  commitmentLevel: 'low' | 'medium' | 'high';
}

export interface ProtocolDay {
  day: number;
  date: Date;
  instructions: string[];
  interventions: {
    type: 'cold_plunge' | 'meditation' | 'fasting' | 'exercise' | 'supplement' | 'sleep' | 'nutrition';
    name: string;
    duration?: number; // minutes or seconds
    timing: string; // "3:30 AM", "after workout", etc.
    details?: string;
  }[];
  expectedOutcome?: string;
}

export interface ProtocolPlan {
  id: string;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  days: ProtocolDay[];
  trackingMetrics: string[]; // ["hrv", "sleep_score", "recovery"]
  successProbability: number; // 0-100%
  expectedResults: {
    hrv?: number; // % improvement
    sleep?: number;
    recovery?: number;
    weight?: number; // lbs lost
  };
}

export interface CorrelationResult {
  metric: string;
  correlation: number; // -1 to 1
  pValue: number; // statistical significance
  improvement: number; // % change
  confidence: 'high' | 'medium' | 'low';
  sampleSize: number;
}

export class ProtocolBuilder {
  /**
   * Generate a 30-day protocol based on user input
   */
  async generateProtocol(input: ProtocolInput): Promise<ProtocolPlan> {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    const days: ProtocolDay[] = [];
    
    // Generate day-by-day protocol based on goal
    for (let day = 1; day <= 30; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day - 1);
      
      const dayPlan = this.generateDayPlan(day, input);
      days.push({
        day,
        date,
        ...dayPlan,
      });
    }

    // Calculate success probability based on similar users
    const successProbability = await this.calculateSuccessProbability(input);

    // Determine expected results
    const expectedResults = this.calculateExpectedResults(input.goal, input.currentState);

    // Determine which metrics to track
    const trackingMetrics = this.getTrackingMetrics(input.goal);

    return {
      id: '', // Will be set when saved to DB
      name: input.name,
      goal: input.goal,
      startDate,
      endDate,
      days,
      trackingMetrics,
      successProbability,
      expectedResults,
    };
  }

  /**
   * Generate instructions for a specific day
   */
  private generateDayPlan(day: number, input: ProtocolInput): Omit<ProtocolDay, 'day' | 'date'> {
    const instructions: string[] = [];
    const interventions: ProtocolDay['interventions'] = [];

    // Week 1: Introduction phase
    if (day <= 7) {
      if (input.goal === 'improve_sleep') {
        instructions.push('Set bedtime to 10:00 PM');
        instructions.push('Avoid screens 1 hour before bed');
        interventions.push({
          type: 'sleep',
          name: 'Sleep Optimization',
          timing: '9:00 PM',
          details: 'Begin wind-down routine',
        });
      } else if (input.goal === 'boost_hrv') {
        instructions.push('Morning meditation: 10 minutes');
        instructions.push('Evening breathwork: 5 minutes');
        interventions.push({
          type: 'meditation',
          name: 'Morning Meditation',
          duration: 10,
          timing: '6:00 AM',
        });
        interventions.push({
          type: 'meditation',
          name: 'Evening Breathwork',
          duration: 5,
          timing: '8:00 PM',
        });
      } else if (input.goal === 'lose_weight') {
        instructions.push('16-hour fasting window');
        instructions.push('Focus on protein and vegetables');
        interventions.push({
          type: 'fasting',
          name: 'Intermittent Fasting',
          duration: 16 * 60, // 16 hours in minutes
          timing: 'Start after dinner',
        });
      }
    }
    // Week 2-3: Building phase
    else if (day <= 21) {
      if (input.goal === 'improve_sleep') {
        instructions.push('Maintain consistent sleep schedule');
        instructions.push('Add magnesium supplement before bed');
        interventions.push({
          type: 'supplement',
          name: 'Magnesium',
          timing: '9:00 PM',
          details: '400mg',
        });
      } else if (input.goal === 'boost_hrv') {
        instructions.push('Increase meditation to 15 minutes');
        if (input.preferences.exercises?.includes('cold_plunge')) {
          instructions.push('Cold plunge: 2 minutes');
          interventions.push({
            type: 'cold_plunge',
            name: 'Cold Plunge',
            duration: 120, // 2 minutes
            timing: '6:30 AM',
          });
        }
      }
    }
    // Week 4: Optimization phase
    else {
      if (input.goal === 'improve_sleep') {
        instructions.push('Optimize sleep environment (65°F, dark)');
        instructions.push('Continue all practices');
      } else if (input.goal === 'boost_hrv') {
        instructions.push('Maintain all practices');
        instructions.push('Track HRV daily');
      }
    }

    // Add rest days
    if (day % 7 === 0) {
      instructions.push('Rest day - light activity only');
    }

    return {
      instructions,
      interventions,
      expectedOutcome: this.getExpectedOutcome(day, input.goal),
    };
  }

  /**
   * Get expected outcome for a day
   */
  private getExpectedOutcome(day: number, goal: string): string {
    if (goal === 'improve_sleep') {
      if (day <= 7) return 'Establishing sleep routine';
      if (day <= 14) return 'Sleep quality improving';
      if (day <= 21) return 'Deep sleep increasing';
      return 'Optimal sleep achieved';
    } else if (goal === 'boost_hrv') {
      if (day <= 7) return 'HRV baseline established';
      if (day <= 14) return 'HRV trending upward';
      if (day <= 21) return 'HRV consistently higher';
      return 'HRV optimized';
    } else if (goal === 'lose_weight') {
      if (day <= 7) return 'Metabolism adapting';
      if (day <= 14) return 'Weight loss beginning';
      if (day <= 21) return 'Steady progress';
      return 'Target weight approaching';
    }
    return 'Progress tracking';
  }

  /**
   * Calculate success probability based on similar users
   */
  private async calculateSuccessProbability(input: ProtocolInput): Promise<number> {
    // Query similar protocols from database
    const similarProtocols = await prisma.protocolExperiment.findMany({
      where: {
        name: input.name,
        status: 'completed',
      },
      take: 100,
    });

    if (similarProtocols.length === 0) {
      // Default probability based on commitment level
      return input.commitmentLevel === 'high' ? 75 : input.commitmentLevel === 'medium' ? 60 : 45;
    }

    // Calculate success rate
    const completedCount = similarProtocols.length;
    const successfulCount = similarProtocols.filter(
      p => p.adherence && p.adherence >= 70
    ).length;

    const baseProbability = (successfulCount / completedCount) * 100;

    // Adjust based on commitment level
    const commitmentMultiplier = input.commitmentLevel === 'high' ? 1.2 : input.commitmentLevel === 'medium' ? 1.0 : 0.8;

    return Math.min(95, Math.max(30, baseProbability * commitmentMultiplier));
  }

  /**
   * Calculate expected results based on goal
   */
  private calculateExpectedResults(goal: string, currentState: ProtocolInput['currentState']): ProtocolPlan['expectedResults'] {
    if (goal === 'improve_sleep') {
      return {
        sleep: 15, // 15% improvement
      };
    } else if (goal === 'boost_hrv') {
      return {
        hrv: 20, // 20% improvement
        recovery: 10,
      };
    } else if (goal === 'lose_weight') {
      return {
        weight: -8, // 8 lbs lost
      };
    }
    return {};
  }

  /**
   * Get metrics to track for a goal
   */
  private getTrackingMetrics(goal: string): string[] {
    if (goal === 'improve_sleep') {
      return ['sleep_score', 'sleep_duration', 'deep_sleep', 'rem_sleep'];
    } else if (goal === 'boost_hrv') {
      return ['hrv', 'recovery', 'readiness'];
    } else if (goal === 'lose_weight') {
      return ['weight', 'body_fat', 'muscle_mass'];
    }
    return ['hrv', 'sleep_score', 'recovery'];
  }

  /**
   * Calculate correlations between protocol adherence and biomarker changes
   */
  async calculateCorrelations(
    protocolId: string,
    userId: string
  ): Promise<CorrelationResult[]> {
    // Get protocol data
    const protocol = await prisma.protocolExperiment.findUnique({
      where: { id: protocolId },
    });

    if (!protocol || !protocol.startDate) {
      throw new Error('Protocol not found');
    }

    // Get biomarker readings during protocol period
    const endDate = protocol.endDate || new Date();
    const biomarkerReadings = await prisma.biomarkerReading.findMany({
      where: {
        userId,
        date: {
          gte: protocol.startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Get protocol completion data (would need a separate table for daily completions)
    // For now, we'll use adherence percentage and correlate with biomarker changes

    const correlations: CorrelationResult[] = [];

    // Group biomarkers by metric type
    const metricsMap = new Map<string, number[]>();
    biomarkerReadings.forEach(reading => {
      const metric = reading.metric;
      if (!metricsMap.has(metric)) {
        metricsMap.set(metric, []);
      }
      metricsMap.get(metric)!.push(reading.value);
    });

    // Calculate correlation for each metric
    for (const [metric, values] of metricsMap.entries()) {
      if (values.length < 7) continue; // Need at least 7 data points

      // Calculate trend (simple linear regression)
      const trend = this.calculateTrend(values);
      const improvement = this.calculateImprovement(values);
      
      // Calculate correlation coefficient (simplified)
      const correlation = this.calculateCorrelationCoefficient(values, protocol.adherence || 0);
      
      // Calculate p-value (simplified)
      const pValue = this.calculatePValue(correlation, values.length);

      correlations.push({
        metric,
        correlation,
        pValue,
        improvement,
        confidence: pValue < 0.05 ? 'high' : pValue < 0.1 ? 'medium' : 'low',
        sampleSize: values.length,
      });
    }

    // Update protocol with correlations
    await prisma.protocolExperiment.update({
      where: { id: protocolId },
      data: {
        correlatedMetrics: correlations.reduce((acc, corr) => {
          acc[corr.metric] = corr.improvement;
          return acc;
        }, {} as Record<string, number>),
      },
    });

    return correlations;
  }

  /**
   * Calculate trend in values (positive = improving, negative = declining)
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  }

  /**
   * Calculate improvement percentage
   */
  private calculateImprovement(values: number[]): number {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    
    if (first === 0) return 0;
    
    return ((last - first) / first) * 100;
  }

  /**
   * Calculate correlation coefficient (simplified Pearson correlation)
   */
  private calculateCorrelationCoefficient(values: number[], adherence: number): number {
    // Simplified: assume adherence is constant, calculate trend correlation
    const trend = this.calculateTrend(values);
    
    // Positive trend with high adherence = positive correlation
    if (adherence > 70 && trend > 0) {
      return Math.min(1, trend / 10); // Normalize
    } else if (adherence < 50 || trend < 0) {
      return Math.max(-1, trend / 10);
    }
    
    return 0;
  }

  /**
   * Calculate p-value (simplified)
   */
  private calculatePValue(correlation: number, sampleSize: number): number {
    // Simplified p-value calculation
    const absCorr = Math.abs(correlation);
    if (sampleSize < 10) return 0.5;
    if (absCorr > 0.7 && sampleSize > 20) return 0.01;
    if (absCorr > 0.5 && sampleSize > 15) return 0.05;
    if (absCorr > 0.3) return 0.1;
    return 0.3;
  }

  /**
   * Save protocol to database
   */
  async saveProtocol(userId: string, plan: ProtocolPlan): Promise<string> {
    const protocol = await prisma.protocolExperiment.create({
      data: {
        userId,
        name: plan.name,
        startDate: plan.startDate,
        endDate: plan.endDate,
        status: 'active',
        notes: JSON.stringify({
          goal: plan.goal,
          days: plan.days,
          trackingMetrics: plan.trackingMetrics,
          expectedResults: plan.expectedResults,
          successProbability: plan.successProbability,
        }),
      },
    });

    return protocol.id;
  }

  /**
   * Get active protocols for a user
   */
  async getActiveProtocols(userId: string) {
    return prisma.protocolExperiment.findMany({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Get protocol with correlations
   */
  async getProtocolWithCorrelations(protocolId: string, userId: string) {
    const protocol = await prisma.protocolExperiment.findUnique({
      where: { id: protocolId },
    });

    if (!protocol) {
      throw new Error('Protocol not found');
    }

    const correlations = await this.calculateCorrelations(protocolId, userId);

    return {
      ...protocol,
      correlations,
    };
  }
}

export const createProtocolBuilder = () => new ProtocolBuilder();
