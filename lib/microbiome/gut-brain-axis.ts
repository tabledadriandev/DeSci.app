/**
 * Gut-Brain Axis Tracking
 * Correlates microbiome composition with mood, cognitive function, and mental health
 */

import { prisma } from '@/lib/prisma';

export interface MoodData {
  date: Date;
  mood: number; // 1-10 scale
  stress: number; // 1-10 scale
  anxiety: number; // 1-10 scale
  energy: number; // 1-10 scale
  cognitiveFunction?: number; // 1-10 scale (memory, focus, clarity)
}

export interface MicrobiomeMoodCorrelation {
  // Correlations (Pearson correlation coefficient: -1 to 1)
  diversityMoodCorrelation: number; // Shannon Index vs mood
  diversityStressCorrelation: number;
  diversityAnxietyCorrelation: number;
  
  // Specific bacteria correlations
  akkermansiaMoodCorrelation?: number;
  bifidobacteriumMoodCorrelation?: number;
  lactobacillusMoodCorrelation?: number;
  faecalibacteriumMoodCorrelation?: number;
  
  // SCFA correlations
  butyrateMoodCorrelation?: number;
  propionateMoodCorrelation?: number;
  
  // Inflammation correlation
  inflammationMoodCorrelation?: number;
  
  // Recommendations
  recommendations: string[];
  riskFactors: string[];
}

export interface SerotoninPrecursorAnalysis {
  tryptophanAvailability: 'low' | 'medium' | 'high';
  serotoninProductionPotential: number; // 0-100
  recommendations: string[];
}

export interface DopaminePrecursorAnalysis {
  tyrosineAvailability: 'low' | 'medium' | 'high';
  dopamineProductionPotential: number; // 0-100
  recommendations: string[];
}

export class GutBrainAxisTracker {
  /**
   * Analyze correlations between microbiome and mood over time
   */
  async analyzeCorrelations(
    userId: string,
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<MicrobiomeMoodCorrelation> {
    // Get microbiome results within timeframe
    const startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
    }

    // TODO: MicrobiomeResult model not yet implemented
    const microbiomeResults: unknown[] = [];
    // const microbiomeResults = await prisma.microbiomeResult.findMany({
    //   where: {
    //     userId,
    //     testDate: { gte: startDate },
    //   },
    //   orderBy: { testDate: 'asc' },
    // });

    // Get mood/symptom data within timeframe
    // TODO: SymptomLog model not yet implemented
    const symptomLogs: unknown[] = [];
    // const symptomLogs = await prisma.symptomLog.findMany({
    //   where: {
    //     userId,
    //     date: { gte: startDate },
    //   },
    //   orderBy: { date: 'asc' },
    // });

    const healthData = await prisma.healthData.findMany({
      where: {
        userId,
        type: 'mood',
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: 'asc' },
    });

    // Combine mood data
    const moodData: MoodData[] = [];
    
    for (const log of symptomLogs) {
      const logTyped = log as { date: Date | string; mood?: string; painIntensity?: number; digestiveIssues?: string[] };
      moodData.push({
        date: logTyped.date instanceof Date ? logTyped.date : new Date(logTyped.date),
        mood: this.mapMoodStringToNumber(logTyped.mood || 'neutral'),
        stress: logTyped.painIntensity ? this.extractStressFromPain(logTyped.painIntensity) : 5,
        anxiety: (logTyped.digestiveIssues?.length || 0) > 0 ? 6 : 5,
        energy: (log as { energyLevel?: number }).energyLevel || 5,
      });
    }

    for (const data of healthData) {
      if (data.type === 'mood') {
        moodData.push({
          date: data.recordedAt,
          mood: data.value,
          stress: 5,
          anxiety: 5,
          energy: 5,
        });
      }
    }

    // Match microbiome results with nearest mood data points
    return this.calculateCorrelations(microbiomeResults, moodData);
  }

  /**
   * Calculate Pearson correlation coefficients
   */
  private calculateCorrelations(
    microbiomeResults: unknown[],
    moodData: MoodData[]
  ): MicrobiomeMoodCorrelation {
    if (microbiomeResults.length < 2 || moodData.length < 2) {
      return {
        diversityMoodCorrelation: 0,
        diversityStressCorrelation: 0,
        diversityAnxietyCorrelation: 0,
        recommendations: ['Need more data points to calculate correlations. Continue tracking microbiome and mood.'],
        riskFactors: [],
      };
    }

    // Match each microbiome result with nearest mood data
    const pairedData: Array<{
      shannonIndex: number;
      akkermansia?: number;
      bifidobacterium?: number;
      lactobacillus?: number;
      faecalibacterium?: number;
      inflammationRisk?: number;
      mood: number;
      stress: number;
      anxiety: number;
    }> = [];

    for (const micro of microbiomeResults) {
      const microTyped = micro as { testDate: Date | string; shannonIndex?: number; [key: string]: unknown };
      const nearestMood = this.findNearestMoodData(
        microTyped.testDate instanceof Date ? microTyped.testDate : new Date(microTyped.testDate),
        moodData
      );
      if (nearestMood) {
        pairedData.push({
          shannonIndex: microTyped.shannonIndex || 0,
          akkermansia: (microTyped.akkermansiaMuciniphila as number | undefined) || undefined,
          bifidobacterium: (microTyped.bifidobacterium as number | undefined) || undefined,
          lactobacillus: (microTyped.lactobacillus as number | undefined) || undefined,
          faecalibacterium: (microTyped.faecalibacteriumPrausnitzii as number | undefined) || undefined,
          inflammationRisk: (microTyped.inflammationRisk as number | undefined) || undefined,
          mood: nearestMood.mood,
          stress: nearestMood.stress,
          anxiety: nearestMood.anxiety,
        });
      }
    }

    if (pairedData.length < 2) {
      return {
        diversityMoodCorrelation: 0,
        diversityStressCorrelation: 0,
        diversityAnxietyCorrelation: 0,
        recommendations: ['Need more paired data points to calculate correlations.'],
        riskFactors: [],
      };
    }

    // Calculate correlations
    const diversityMoodCorrelation = this.pearsonCorrelation(
      pairedData.map(d => d.shannonIndex),
      pairedData.map(d => d.mood)
    );

    const diversityStressCorrelation = this.pearsonCorrelation(
      pairedData.map(d => d.shannonIndex),
      pairedData.map(d => d.stress)
    );

    const diversityAnxietyCorrelation = this.pearsonCorrelation(
      pairedData.map(d => d.shannonIndex),
      pairedData.map(d => d.anxiety)
    );

    // Calculate specific bacteria correlations
    const akkermansiaData = pairedData.filter(d => d.akkermansia !== undefined);
    const akkermansiaMoodCorrelation = akkermansiaData.length >= 2
      ? this.pearsonCorrelation(
          akkermansiaData.map(d => d.akkermansia!),
          akkermansiaData.map(d => d.mood)
        )
      : undefined;

    const bifidobacteriumData = pairedData.filter(d => d.bifidobacterium !== undefined);
    const bifidobacteriumMoodCorrelation = bifidobacteriumData.length >= 2
      ? this.pearsonCorrelation(
          bifidobacteriumData.map(d => d.bifidobacterium!),
          bifidobacteriumData.map(d => d.mood)
        )
      : undefined;

    const lactobacillusData = pairedData.filter(d => d.lactobacillus !== undefined);
    const lactobacillusMoodCorrelation = lactobacillusData.length >= 2
      ? this.pearsonCorrelation(
          lactobacillusData.map(d => d.lactobacillus!),
          lactobacillusData.map(d => d.mood)
        )
      : undefined;

    const faecalibacteriumData = pairedData.filter(d => d.faecalibacterium !== undefined);
    const faecalibacteriumMoodCorrelation = faecalibacteriumData.length >= 2
      ? this.pearsonCorrelation(
          faecalibacteriumData.map(d => d.faecalibacterium!),
          faecalibacteriumData.map(d => d.mood)
        )
      : undefined;

    const inflammationData = pairedData.filter(d => d.inflammationRisk !== undefined);
    const inflammationMoodCorrelation = inflammationData.length >= 2
      ? this.pearsonCorrelation(
          inflammationData.map(d => d.inflammationRisk!),
          inflammationData.map(d => d.mood)
        )
      : undefined;

    // Generate recommendations
    const recommendations = this.generateGutBrainRecommendations({
      diversityMoodCorrelation,
      diversityStressCorrelation,
      akkermansiaMoodCorrelation,
      bifidobacteriumMoodCorrelation,
      inflammationMoodCorrelation,
    });

    const riskFactors = this.identifyRiskFactors({
      diversityMoodCorrelation,
      diversityStressCorrelation,
      diversityAnxietyCorrelation,
      inflammationMoodCorrelation,
    });

    return {
      diversityMoodCorrelation,
      diversityStressCorrelation,
      diversityAnxietyCorrelation,
      akkermansiaMoodCorrelation,
      bifidobacteriumMoodCorrelation,
      lactobacillusMoodCorrelation,
      faecalibacteriumMoodCorrelation,
      inflammationMoodCorrelation,
      recommendations,
      riskFactors,
    };
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a: number, b: number) => a + b, 0);
    const sumY = y.reduce((a: number, b: number) => a + b, 0);
    const sumXY = x.reduce((sum: number, xi: number, i: number) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum: number, xi: number) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum: number, yi: number) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    if (denominator === 0) return 0;

    return numerator / denominator;
  }

  /**
   * Find nearest mood data point to a given date
   */
  private findNearestMoodData(date: Date, moodData: MoodData[]): MoodData | null {
    if (moodData.length === 0) return null;

    let nearest = moodData[0];
    let minDiff = Math.abs(date.getTime() - nearest.date.getTime());

    for (const mood of moodData.slice(1)) {
      const diff = Math.abs(date.getTime() - mood.date.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        nearest = mood;
      }
    }

    // Only return if within 7 days
    if (minDiff > 7 * 24 * 60 * 60 * 1000) return null;

    return nearest;
  }

  /**
   * Map mood string to number
   */
  private mapMoodStringToNumber(mood: string): number {
    const moodMap: Record<string, number> = {
      happy: 8,
      neutral: 5,
      anxious: 4,
      depressed: 2,
      stressed: 3,
    };
    return moodMap[mood.toLowerCase()] || 5;
  }

  /**
   * Extract stress level from pain intensity
   */
  private extractStressFromPain(painIntensity: unknown): number {
    if (Array.isArray(painIntensity)) {
      const avgIntensity = painIntensity.reduce((sum: number, p: unknown) => {
        const pain = p as { intensity?: number };
        return sum + (pain.intensity || 0);
      }, 0) / painIntensity.length;
      return Math.max(1, Math.min(10, avgIntensity));
    }
    return 5;
  }

  /**
   * Generate recommendations based on correlations
   */
  private generateGutBrainRecommendations(correlations: {
    diversityMoodCorrelation: number;
    diversityStressCorrelation: number;
    akkermansiaMoodCorrelation?: number;
    bifidobacteriumMoodCorrelation?: number;
    inflammationMoodCorrelation?: number;
  }): string[] {
    const recommendations: string[] = [];

    if (correlations.diversityMoodCorrelation > 0.5) {
      recommendations.push('Strong positive correlation between microbiome diversity and mood. Continue maintaining diverse diet.');
    } else if (correlations.diversityMoodCorrelation < -0.3) {
      recommendations.push('Negative correlation between diversity and mood detected. Focus on increasing dietary diversity and fermented foods.');
    }

    if (correlations.akkermansiaMoodCorrelation && correlations.akkermansiaMoodCorrelation > 0.4) {
      recommendations.push('Akkermansia muciniphila shows positive correlation with mood. Include polyphenol-rich foods (berries, pomegranate) to support it.');
    }

    if (correlations.bifidobacteriumMoodCorrelation && correlations.bifidobacteriumMoodCorrelation > 0.4) {
      recommendations.push('Bifidobacterium correlates with improved mood. Include prebiotics (onions, garlic, bananas) to support it.');
    }

    if (correlations.inflammationMoodCorrelation && correlations.inflammationMoodCorrelation < -0.4) {
      recommendations.push('High inflammation risk correlates with lower mood. Focus on anti-inflammatory foods and reducing processed foods.');
    }

    if (correlations.diversityStressCorrelation < -0.3) {
      recommendations.push('Low diversity correlates with higher stress. Consider stress management techniques (meditation, breathwork) alongside dietary changes.');
    }

    return recommendations.length > 0 ? recommendations : ['Continue tracking microbiome and mood to identify patterns.'];
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(correlations: {
    diversityMoodCorrelation: number;
    diversityStressCorrelation: number;
    diversityAnxietyCorrelation: number;
    inflammationMoodCorrelation?: number;
  }): string[] {
    const riskFactors: string[] = [];

    if (correlations.diversityMoodCorrelation < -0.5) {
      riskFactors.push('Low microbiome diversity strongly correlates with poor mood.');
    }

    if (correlations.diversityAnxietyCorrelation < -0.4) {
      riskFactors.push('Low diversity correlates with increased anxiety.');
    }

    if (correlations.inflammationMoodCorrelation && correlations.inflammationMoodCorrelation < -0.5) {
      riskFactors.push('High inflammation risk strongly correlates with poor mood.');
    }

    return riskFactors;
  }

  /**
   * Analyze serotonin precursor availability
   */
  analyzeSerotoninPrecursors(microbiomeResult: unknown): SerotoninPrecursorAnalysis {
    // Tryptophan is converted to serotonin by certain gut bacteria
    // Good indicators: High Bifidobacterium, Lactobacillus, low inflammation
    
    const resultTyped = microbiomeResult as { bifidobacterium?: number; lactobacillus?: number; inflammationRisk?: number; shannonIndex?: number };
    const bifidobacterium = resultTyped.bifidobacterium || 0;
    const lactobacillus = resultTyped.lactobacillus || 0;
    const inflammationRisk = resultTyped.inflammationRisk || 5;
    const shannonIndex = resultTyped.shannonIndex || 0;

    let tryptophanAvailability: 'low' | 'medium' | 'high' = 'medium';
    let serotoninPotential = 50;

    // Higher beneficial bacteria = better tryptophan metabolism
    if (bifidobacterium > 0.05 || lactobacillus > 0.05) {
      serotoninPotential += 20;
      tryptophanAvailability = 'high';
    } else if (bifidobacterium < 0.01 && lactobacillus < 0.01) {
      serotoninPotential -= 20;
      tryptophanAvailability = 'low';
    }

    // Inflammation reduces serotonin production
    if (inflammationRisk > 7) {
      serotoninPotential -= 15;
      if (tryptophanAvailability === 'high') tryptophanAvailability = 'medium';
      if (tryptophanAvailability === 'medium') tryptophanAvailability = 'low';
    }

    // Diversity supports overall gut health
    if (shannonIndex > 4) {
      serotoninPotential += 10;
    } else if (shannonIndex < 2) {
      serotoninPotential -= 10;
    }

    const recommendations: string[] = [];

    if (tryptophanAvailability === 'low') {
      recommendations.push('Low serotonin precursor availability. Increase tryptophan-rich foods (turkey, eggs, nuts, seeds) and support beneficial bacteria.');
    }

    if (inflammationRisk > 7) {
      recommendations.push('High inflammation may be reducing serotonin production. Focus on anti-inflammatory diet.');
    }

    if (bifidobacterium < 0.01) {
      recommendations.push('Low Bifidobacterium may limit serotonin production. Consider probiotic supplementation.');
    }

    return {
      tryptophanAvailability,
      serotoninProductionPotential: Math.max(0, Math.min(100, serotoninPotential)),
      recommendations,
    };
  }

  /**
   * Analyze dopamine precursor availability
   */
  analyzeDopaminePrecursors(microbiomeResult: unknown): DopaminePrecursorAnalysis {
    // Tyrosine is converted to dopamine
    // Good indicators: Low inflammation, good diversity, healthy gut barrier
    
    const resultTyped = microbiomeResult as { inflammationRisk?: number; gutPermeabilityRisk?: number; shannonIndex?: number; akkermansiaMuciniphila?: number };
    const inflammationRisk = resultTyped.inflammationRisk || 5;
    const gutPermeabilityRisk = resultTyped.gutPermeabilityRisk || 5;
    const shannonIndex = resultTyped.shannonIndex || 0;
    const akkermansia = resultTyped.akkermansiaMuciniphila || 0;

    let tyrosineAvailability: 'low' | 'medium' | 'high' = 'medium';
    let dopaminePotential = 50;

    // Low inflammation supports dopamine production
    if (inflammationRisk < 3) {
      dopaminePotential += 15;
      tyrosineAvailability = 'high';
    } else if (inflammationRisk > 7) {
      dopaminePotential -= 20;
      tyrosineAvailability = 'low';
    }

    // Healthy gut barrier (Akkermansia) supports nutrient absorption
    if (akkermansia > 0.01) {
      dopaminePotential += 10;
      if (tyrosineAvailability === 'low') tyrosineAvailability = 'medium';
    }

    // Low gut permeability risk supports dopamine
    if (gutPermeabilityRisk < 3) {
      dopaminePotential += 10;
    } else if (gutPermeabilityRisk > 7) {
      dopaminePotential -= 15;
      if (tyrosineAvailability === 'high') tyrosineAvailability = 'medium';
    }

    const recommendations: string[] = [];

    if (tyrosineAvailability === 'low') {
      recommendations.push('Low dopamine precursor availability. Increase tyrosine-rich foods (chicken, fish, almonds, avocados) and reduce inflammation.');
    }

    if (gutPermeabilityRisk > 7) {
      recommendations.push('High gut permeability may limit nutrient absorption. Support gut barrier with Akkermansia-promoting foods (polyphenols).');
    }

    return {
      tyrosineAvailability,
      dopamineProductionPotential: Math.max(0, Math.min(100, dopaminePotential)),
      recommendations,
    };
  }
}

export const gutBrainAxisTracker = new GutBrainAxisTracker();

