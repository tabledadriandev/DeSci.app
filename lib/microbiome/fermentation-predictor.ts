/**
 * Fermentation Prediction Engine
 * Predicts SCFA production (butyrate, propionate, acetate) from meal composition
 */

export interface MealComposition {
  // Resistant Starch
  resistantStarch?: {
    type1?: number; // grams
    type2?: number; // grams
    type3?: number; // grams
  };
  
  // Polyphenols (mg)
  polyphenols?: {
    quercetin?: number;
    anthocyanins?: number;
    ferulicAcid?: number;
    resveratrol?: number;
    total?: number;
  };
  
  // Fiber (grams)
  fiber?: number;
  
  // Other fermentable substrates
  inulin?: number; // grams
  fructooligosaccharides?: number; // grams
  pectins?: number; // grams
}

export interface FermentationPrediction {
  // Predicted SCFA production (mM or mmol)
  butyrate: {
    predicted: number; // mmol
    peakTime: number; // hours after meal
    duration: number; // hours
  };
  propionate: {
    predicted: number; // mmol
    peakTime: number;
    duration: number;
  };
  acetate: {
    predicted: number; // mmol
    peakTime: number;
    duration: number;
  };
  
  // Total SCFA production
  totalSCFA: number;
  
  // Recommendations
  recommendations: string[];
  optimalTiming: string; // Best time to consume for optimal fermentation
}

export class FermentationPredictor {
  /**
   * Predict SCFA production from meal composition
   */
  async predictFermentation(
    mealComposition: MealComposition,
    userMicrobiome?: {
      shannonIndex?: number;
      scfaProducers?: Array<{ species: string; abundance: number; scfaType: string }>;
    }
  ): Promise<FermentationPrediction> {
    const predictions = {
      butyrate: this.predictButyrate(mealComposition, userMicrobiome),
      propionate: this.predictPropionate(mealComposition, userMicrobiome),
      acetate: this.predictAcetate(mealComposition, userMicrobiome),
    };

    const totalSCFA = predictions.butyrate.predicted + predictions.propionate.predicted + predictions.acetate.predicted;

    const recommendations = this.generateRecommendations(mealComposition, predictions, userMicrobiome);
    const optimalTiming = this.calculateOptimalTiming(predictions);

    return {
      ...predictions,
      totalSCFA,
      recommendations,
      optimalTiming,
    };
  }

  /**
   * Predict butyrate production
   * Butyrate is primarily produced from resistant starch (especially RS3) and fiber
   */
  private predictButyrate(
    meal: MealComposition,
    microbiome?: { scfaProducers?: Array<{ species: string; abundance: number; scfaType: string }> }
  ): { predicted: number; peakTime: number; duration: number } {
    let butyrate = 0;

    // Resistant starch contributes significantly to butyrate
    const rsTotal = (meal.resistantStarch?.type1 || 0) + 
                    (meal.resistantStarch?.type2 || 0) + 
                    (meal.resistantStarch?.type3 || 0);
    
    // RS3 (retrograded starch) produces more butyrate
    const rs3 = meal.resistantStarch?.type3 || 0;
    const rs1and2 = (meal.resistantStarch?.type1 || 0) + (meal.resistantStarch?.type2 || 0);

    // Approximate: 1g RS → 0.3-0.5 mmol butyrate (with good butyrate producers)
    butyrate += rs3 * 0.5;
    butyrate += rs1and2 * 0.3;

    // Fiber contributes (especially soluble fiber)
    const fiber = meal.fiber || 0;
    butyrate += fiber * 0.1; // Lower conversion rate

    // Inulin specifically boosts butyrate
    if (meal.inulin) {
      butyrate += meal.inulin * 0.2;
    }

    // Adjust based on user's butyrate-producing bacteria
    if (microbiome?.scfaProducers) {
      const butyrateProducers = microbiome.scfaProducers.filter(p => p.scfaType === 'butyrate');
      const totalAbundance = butyrateProducers.reduce((sum: number, p: typeof butyrateProducers[0]) => sum + p.abundance, 0);
      // Higher abundance = better conversion (multiplier: 0.5 to 1.5)
      const multiplier = 0.5 + (totalAbundance * 1.0);
      butyrate *= multiplier;
    }

    // Peak time: 8-12 hours for resistant starch, 4-6 hours for soluble fiber
    const rsWeight = rsTotal / (rsTotal + (fiber || 0.1));
    const peakTime = rsWeight * 10 + (1 - rsWeight) * 5; // Weighted average

    // Duration: 12-24 hours for resistant starch
    const duration = 12 + (rsTotal * 0.5);

    return {
      predicted: Math.max(0, butyrate),
      peakTime: Math.max(4, Math.min(24, peakTime)),
      duration: Math.max(6, Math.min(48, duration)),
    };
  }

  /**
   * Predict propionate production
   * Propionate is primarily produced from pectins, resistant starch type 2, and some fiber
   */
  private predictPropionate(
    meal: MealComposition,
    microbiome?: { scfaProducers?: Array<{ species: string; abundance: number; scfaType: string }> }
  ): { predicted: number; peakTime: number; duration: number } {
    let propionate = 0;

    // Pectins are excellent propionate sources
    if (meal.pectins) {
      propionate += meal.pectins * 0.4;
    }

    // Resistant starch type 2 produces more propionate
    const rs2 = meal.resistantStarch?.type2 || 0;
    propionate += rs2 * 0.25;

    // RS1 and RS3 also contribute
    const rs1 = meal.resistantStarch?.type1 || 0;
    const rs3 = meal.resistantStarch?.type3 || 0;
    propionate += rs1 * 0.15;
    propionate += rs3 * 0.15;

    // Fiber contributes
    const fiber = meal.fiber || 0;
    propionate += fiber * 0.08;

    // Adjust based on user's propionate-producing bacteria
    if (microbiome?.scfaProducers) {
      const propionateProducers = microbiome.scfaProducers.filter(p => p.scfaType === 'propionate');
      const totalAbundance = propionateProducers.reduce((sum: number, p: typeof propionateProducers[0]) => sum + p.abundance, 0);
      const multiplier = 0.5 + (totalAbundance * 1.0);
      propionate *= multiplier;
    }

    // Peak time: 6-10 hours
    const peakTime = 8;

    // Duration: 8-16 hours
    const duration = 12;

    return {
      predicted: Math.max(0, propionate),
      peakTime: Math.max(4, Math.min(20, peakTime)),
      duration: Math.max(6, Math.min(32, duration)),
    };
  }

  /**
   * Predict acetate production
   * Acetate is produced from most fermentable substrates
   */
  private predictAcetate(
    meal: MealComposition,
    microbiome?: { scfaProducers?: Array<{ species: string; abundance: number; scfaType: string }> }
  ): { predicted: number; peakTime: number; duration: number } {
    let acetate = 0;

    // Acetate is the most common SCFA, produced from many substrates
    const rsTotal = (meal.resistantStarch?.type1 || 0) + 
                    (meal.resistantStarch?.type2 || 0) + 
                    (meal.resistantStarch?.type3 || 0);
    acetate += rsTotal * 0.2;

    const fiber = meal.fiber || 0;
    acetate += fiber * 0.15;

    if (meal.inulin) {
      acetate += meal.inulin * 0.3;
    }

    if (meal.fructooligosaccharides) {
      acetate += meal.fructooligosaccharides * 0.35;
    }

    // Polyphenols can enhance acetate production indirectly
    const polyphenolTotal = meal.polyphenols?.total || 0;
    acetate += (polyphenolTotal / 1000) * 0.1; // mg to g conversion, small boost

    // Adjust based on user's acetate-producing bacteria
    if (microbiome?.scfaProducers) {
      const acetateProducers = microbiome.scfaProducers.filter(p => p.scfaType === 'acetate');
      const totalAbundance = acetateProducers.reduce((sum: number, p: typeof acetateProducers[0]) => sum + p.abundance, 0);
      const multiplier = 0.6 + (totalAbundance * 0.9);
      acetate *= multiplier;
    }

    // Peak time: 4-8 hours (fastest fermentation)
    const peakTime = 6;

    // Duration: 6-12 hours
    const duration = 8;

    return {
      predicted: Math.max(0, acetate),
      peakTime: Math.max(2, Math.min(16, peakTime)),
      duration: Math.max(4, Math.min(24, duration)),
    };
  }

  /**
   * Generate recommendations based on predictions
   */
  private generateRecommendations(
    meal: MealComposition,
    predictions: {
      butyrate: { predicted: number };
      propionate: { predicted: number };
      acetate: { predicted: number };
    },
    microbiome?: { shannonIndex?: number }
  ): string[] {
    const recommendations: string[] = [];

    // Butyrate recommendations
    if (predictions.butyrate.predicted < 5) {
      recommendations.push('Low butyrate production predicted. Consider adding more resistant starch (cooked and cooled potatoes, green bananas, legumes).');
    } else if (predictions.butyrate.predicted > 15) {
      recommendations.push('High butyrate production predicted! This meal supports gut barrier function.');
    }

    // Diversity recommendations
    if (microbiome && (microbiome.shannonIndex || 0) < 3) {
      recommendations.push('Your microbiome diversity is low. Focus on increasing dietary variety to support fermentation.');
    }

    // Prebiotic recommendations
    const totalPrebiotics = (meal.resistantStarch?.type1 || 0) + 
                           (meal.resistantStarch?.type2 || 0) + 
                           (meal.resistantStarch?.type3 || 0) + 
                           (meal.fiber || 0) + 
                           (meal.inulin || 0);
    
    if (totalPrebiotics < 5) {
      recommendations.push('Add more prebiotic fiber (onions, garlic, leeks, asparagus, bananas) to support SCFA production.');
    }

    // Polyphenol recommendations
    const polyphenolTotal = meal.polyphenols?.total || 0;
    if (polyphenolTotal < 500) {
      recommendations.push('Add polyphenol-rich foods (berries, dark chocolate, green tea, olive oil) to enhance fermentation.');
    }

    return recommendations;
  }

  /**
   * Calculate optimal timing for meal consumption
   */
  private calculateOptimalTiming(
    predictions: {
      butyrate: { peakTime: number };
      propionate: { peakTime: number };
      acetate: { peakTime: number };
    }
  ): string {
    // Average peak time
    const avgPeakTime = (predictions.butyrate.peakTime + 
                         predictions.propionate.peakTime + 
                         predictions.acetate.peakTime) / 3;

    if (avgPeakTime < 6) {
      return 'Best consumed in the evening (4-6 hours before bedtime) for overnight fermentation.';
    } else if (avgPeakTime < 10) {
      return 'Best consumed with breakfast or lunch for daytime fermentation benefits.';
    } else {
      return 'Best consumed in the morning for extended fermentation throughout the day.';
    }
  }
}

export const fermentationPredictor = new FermentationPredictor();

