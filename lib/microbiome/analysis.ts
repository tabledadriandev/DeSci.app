/**
 * Microbiome Analysis Library
 * Processes microbiome test results from various sources (Viome, Ombre, Tiny Health, Thorne)
 */

import { prisma } from '@/lib/prisma';

export interface MicrobiomeTestData {
  source: 'viome' | 'ombre' | 'tiny_health' | 'thorne' | 'manual';
  sourceId?: string;
  testDate: Date;
  
  // Raw data from test provider
  rawData: any;
  
  // Parsed data (if available)
  shannonIndex?: number;
  simpsonIndex?: number;
  speciesRichness?: number;
  speciesComposition?: Array<{ species: string; abundance: number; phylum?: string }>;
  pathogens?: Array<{ name: string; presence: boolean; level?: 'low' | 'medium' | 'high' }>;
}

export interface ProcessedMicrobiomeResult {
  shannonIndex: number;
  simpsonIndex?: number;
  speciesRichness?: number;
  
  // Phyla percentages
  firmicutesPercentage: number;
  bacteroidetesPercentage: number;
  actinobacteriaPercentage: number;
  proteobacteriaPercentage: number;
  verrucomicrobiaPercentage: number;
  otherPercentage: number;
  
  // Key beneficial bacteria
  akkermansiaMuciniphila?: number;
  bifidobacterium?: number;
  lactobacillus?: number;
  faecalibacteriumPrausnitzii?: number;
  
  // Pathogens
  pathogens?: Array<{ name: string; presence: boolean; level: 'low' | 'medium' | 'high' }>;
  
  // SCFA producers
  scfaProducers?: Array<{ species: string; abundance: number; scfaType: 'butyrate' | 'propionate' | 'acetate' }>;
  
  // Health indicators
  inflammationRisk?: number;
  gutPermeabilityRisk?: number;
  digestionScore?: number;
}

export class MicrobiomeAnalyzer {
  /**
   * Parse microbiome test data from various sources
   */
  async parseTestData(testData: MicrobiomeTestData): Promise<ProcessedMicrobiomeResult> {
    switch (testData.source) {
      case 'viome':
        return this.parseViomeData(testData.rawData);
      case 'ombre':
        return this.parseOmbreData(testData.rawData);
      case 'tiny_health':
        return this.parseTinyHealthData(testData.rawData);
      case 'thorne':
        return this.parseThorneData(testData.rawData);
      case 'manual':
        return this.parseManualData(testData.rawData);
      default:
        throw new Error(`Unknown microbiome test source: ${testData.source}`);
    }
  }

  /**
   * Parse Viome test results
   */
  private parseViomeData(rawData: any): ProcessedMicrobiomeResult {
    // Viome typically provides:
    // - Species composition with abundance
    // - Metabolic activity scores
    // - Pathogen detection
    
    const species = rawData.species || rawData.bacteria || [];
    const diversity = this.calculateDiversity(species);
    const phyla = this.calculatePhylaDistribution(species);
    const beneficial = this.identifyBeneficialBacteria(species);
    const pathogens = this.identifyPathogens(rawData.pathogens || rawData.concerningBacteria || []);
    
    return {
      shannonIndex: diversity.shannon,
      simpsonIndex: diversity.simpson,
      speciesRichness: diversity.richness,
      ...phyla,
      ...beneficial,
      pathogens,
      inflammationRisk: this.calculateInflammationRisk(species, rawData.inflammationMarkers),
      gutPermeabilityRisk: this.calculateGutPermeabilityRisk(species),
      digestionScore: this.calculateDigestionScore(species),
    };
  }

  /**
   * Parse Ombre (formerly Thryve) test results
   */
  private parseOmbreData(rawData: any): ProcessedMicrobiomeResult {
    const species = rawData.bacteria || rawData.species || [];
    const diversity = this.calculateDiversity(species);
    const phyla = this.calculatePhylaDistribution(species);
    const beneficial = this.identifyBeneficialBacteria(species);
    
    return {
      shannonIndex: diversity.shannon,
      simpsonIndex: diversity.simpson,
      speciesRichness: diversity.richness,
      ...phyla,
      ...beneficial,
      inflammationRisk: this.calculateInflammationRisk(species),
    };
  }

  /**
   * Parse Tiny Health test results
   */
  private parseTinyHealthData(rawData: any): ProcessedMicrobiomeResult {
    const species = rawData.composition || rawData.species || [];
    const diversity = this.calculateDiversity(species);
    const phyla = this.calculatePhylaDistribution(species);
    const beneficial = this.identifyBeneficialBacteria(species);
    
    return {
      shannonIndex: diversity.shannon,
      simpsonIndex: diversity.simpson,
      speciesRichness: diversity.richness,
      ...phyla,
      ...beneficial,
      digestionScore: this.calculateDigestionScore(species),
    };
  }

  /**
   * Parse Thorne test results
   */
  private parseThorneData(rawData: any): ProcessedMicrobiomeResult {
    const species = rawData.microbiome || rawData.bacteria || [];
    const diversity = this.calculateDiversity(species);
    const phyla = this.calculatePhylaDistribution(species);
    const beneficial = this.identifyBeneficialBacteria(species);
    const pathogens = this.identifyPathogens(rawData.pathogens || []);
    
    return {
      shannonIndex: diversity.shannon,
      simpsonIndex: diversity.simpson,
      speciesRichness: diversity.richness,
      ...phyla,
      ...beneficial,
      pathogens,
      inflammationRisk: this.calculateInflammationRisk(species),
    };
  }

  /**
   * Parse manually entered data
   */
  private parseManualData(rawData: any): ProcessedMicrobiomeResult {
    // Manual entry should have already formatted data
    return {
      shannonIndex: rawData.shannonIndex || 0,
      simpsonIndex: rawData.simpsonIndex,
      speciesRichness: rawData.speciesRichness,
      firmicutesPercentage: rawData.firmicutesPercentage || 0,
      bacteroidetesPercentage: rawData.bacteroidetesPercentage || 0,
      actinobacteriaPercentage: rawData.actinobacteriaPercentage || 0,
      proteobacteriaPercentage: rawData.proteobacteriaPercentage || 0,
      verrucomicrobiaPercentage: rawData.verrucomicrobiaPercentage || 0,
      otherPercentage: rawData.otherPercentage || 0,
      akkermansiaMuciniphila: rawData.akkermansiaMuciniphila,
      bifidobacterium: rawData.bifidobacterium,
      lactobacillus: rawData.lactobacillus,
      faecalibacteriumPrausnitzii: rawData.faecalibacteriumPrausnitzii,
      pathogens: rawData.pathogens,
      inflammationRisk: rawData.inflammationRisk,
      gutPermeabilityRisk: rawData.gutPermeabilityRisk,
      digestionScore: rawData.digestionScore,
    };
  }

  /**
   * Calculate diversity indices from species composition
   */
  private calculateDiversity(
    species: Array<{ species?: string; abundance: number; name?: string }>
  ): { shannon: number; simpson: number; richness: number } {
    if (!species || species.length === 0) {
      return { shannon: 0, simpson: 0, richness: 0 };
    }

    const total = species.reduce((sum, s) => sum + (s.abundance || 0), 0);
    if (total === 0) {
      return { shannon: 0, simpson: 0, richness: 0 };
    }

    // Shannon Index: -Σ(pi * ln(pi))
    let shannon = 0;
    let simpson = 0;

    for (const s of species) {
      const pi = (s.abundance || 0) / total;
      if (pi > 0) {
        shannon -= pi * Math.log(pi);
        simpson += pi * pi;
      }
    }

    // Simpson Index: 1 - D (D = dominance)
    const simpsonDiversity = 1 - simpson;

    return {
      shannon,
      simpson: simpsonDiversity,
      richness: species.length,
    };
  }

  /**
   * Calculate phyla distribution percentages
   */
  private calculatePhylaDistribution(
    species: Array<{ species?: string; phylum?: string; abundance: number; name?: string }>
  ): {
    firmicutesPercentage: number;
    bacteroidetesPercentage: number;
    actinobacteriaPercentage: number;
    proteobacteriaPercentage: number;
    verrucomicrobiaPercentage: number;
    otherPercentage: number;
  } {
    const phylaCounts: Record<string, number> = {
      Firmicutes: 0,
      Bacteroidetes: 0,
      Actinobacteria: 0,
      Proteobacteria: 0,
      Verrucomicrobia: 0,
      Other: 0,
    };

    const total = species.reduce((sum, s) => sum + (s.abundance || 0), 0);

    for (const s of species) {
      const phylum = s.phylum || 'Other';
      const abundance = s.abundance || 0;

      if (phylaCounts.hasOwnProperty(phylum)) {
        phylaCounts[phylum] += abundance;
      } else {
        phylaCounts.Other += abundance;
      }
    }

    return {
      firmicutesPercentage: total > 0 ? (phylaCounts.Firmicutes / total) * 100 : 0,
      bacteroidetesPercentage: total > 0 ? (phylaCounts.Bacteroidetes / total) * 100 : 0,
      actinobacteriaPercentage: total > 0 ? (phylaCounts.Actinobacteria / total) * 100 : 0,
      proteobacteriaPercentage: total > 0 ? (phylaCounts.Proteobacteria / total) * 100 : 0,
      verrucomicrobiaPercentage: total > 0 ? (phylaCounts.Verrucomicrobia / total) * 100 : 0,
      otherPercentage: total > 0 ? (phylaCounts.Other / total) * 100 : 0,
    };
  }

  /**
   * Identify beneficial bacteria and their abundances
   */
  private identifyBeneficialBacteria(
    species: Array<{ species?: string; abundance: number; name?: string }>
  ): {
    akkermansiaMuciniphila?: number;
    bifidobacterium?: number;
    lactobacillus?: number;
    faecalibacteriumPrausnitzii?: number;
  } {
    const beneficial: Record<string, number> = {};

    const beneficialSpecies = [
      { names: ['Akkermansia', 'Akkermansia muciniphila'], key: 'akkermansiaMuciniphila' },
      { names: ['Bifidobacterium', 'Bifidobacterium'], key: 'bifidobacterium' },
      { names: ['Lactobacillus', 'Lactobacillus'], key: 'lactobacillus' },
      { names: ['Faecalibacterium', 'Faecalibacterium prausnitzii'], key: 'faecalibacteriumPrausnitzii' },
    ];

    for (const s of species) {
      const name = (s.species || s.name || '').toLowerCase();
      for (const beneficialSpec of beneficialSpecies) {
        if (beneficialSpec.names.some(n => name.includes(n.toLowerCase()))) {
          beneficial[beneficialSpec.key] = (beneficial[beneficialSpec.key] || 0) + (s.abundance || 0);
        }
      }
    }

    return beneficial as any;
  }

  /**
   * Identify pathogens from test data
   */
  private identifyPathogens(
    pathogenData: Array<{ name?: string; species?: string; presence?: boolean; level?: string; abundance?: number }>
  ): Array<{ name: string; presence: boolean; level: 'low' | 'medium' | 'high' }> {
    return pathogenData.map(p => ({
      name: p.name || p.species || 'Unknown',
      presence: p.presence !== false && (p.abundance || 0) > 0,
      level: (p.level as 'low' | 'medium' | 'high') || ((p.abundance || 0) > 0.05 ? 'high' : (p.abundance || 0) > 0.01 ? 'medium' : 'low'),
    }));
  }

  /**
   * Calculate inflammation risk based on microbiome composition
   */
  private calculateInflammationRisk(
    species: Array<{ species?: string; abundance: number }>,
    inflammationMarkers?: any
  ): number {
    // Higher Proteobacteria and lower beneficial bacteria = higher inflammation risk
    const proteobacteriaAbundance = species
      .filter(s => s.species?.toLowerCase().includes('proteobacteria'))
      .reduce((sum, s) => sum + (s.abundance || 0), 0);
    
    const beneficialAbundance = species
      .filter(s => 
        s.species?.toLowerCase().includes('faecalibacterium') ||
        s.species?.toLowerCase().includes('akkermansia')
      )
      .reduce((sum, s) => sum + (s.abundance || 0), 0);

    const total = species.reduce((sum, s) => sum + (s.abundance || 0), 1);
    const proteobacteriaRatio = proteobacteriaAbundance / total;
    const beneficialRatio = beneficialAbundance / total;

    // Risk scale: 0-10
    let risk = 5; // Baseline
    risk += proteobacteriaRatio * 10 * 3; // Higher Proteobacteria increases risk
    risk -= beneficialRatio * 10 * 2; // Beneficial bacteria decrease risk

    return Math.max(0, Math.min(10, risk));
  }

  /**
   * Calculate gut permeability risk
   */
  private calculateGutPermeabilityRisk(
    species: Array<{ species?: string; abundance: number }>
  ): number {
    // Lower Akkermansia and beneficial bacteria = higher permeability risk
    const akkermansiaAbundance = species
      .filter(s => s.species?.toLowerCase().includes('akkermansia'))
      .reduce((sum, s) => sum + (s.abundance || 0), 0);

    const total = species.reduce((sum, s) => sum + (s.abundance || 0), 1);
    const akkermansiaRatio = akkermansiaAbundance / total;

    // Risk scale: 0-10
    let risk = 5; // Baseline
    risk -= akkermansiaRatio * 10 * 2; // Akkermansia decreases risk

    return Math.max(0, Math.min(10, risk));
  }

  /**
   * Calculate digestion score based on microbiome composition
   */
  private calculateDigestionScore(
    species: Array<{ species?: string; abundance: number }>
  ): number {
    // Higher diversity and beneficial bacteria = better digestion
    const diversity = this.calculateDiversity(species);
    const beneficialAbundance = species
      .filter(s =>
        s.species?.toLowerCase().includes('bifidobacterium') ||
        s.species?.toLowerCase().includes('lactobacillus') ||
        s.species?.toLowerCase().includes('faecalibacterium')
      )
      .reduce((sum, s) => sum + (s.abundance || 0), 0);

    const total = species.reduce((sum, s) => sum + (s.abundance || 0), 1);
    const beneficialRatio = beneficialAbundance / total;

    // Score scale: 0-100
    let score = 50; // Baseline
    score += diversity.shannon * 10; // Diversity increases score
    score += beneficialRatio * 100 * 2; // Beneficial bacteria increase score

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Identify SCFA-producing bacteria
   */
  identifySCFAProducers(
    species: Array<{ species?: string; abundance: number }>
  ): Array<{ species: string; abundance: number; scfaType: 'butyrate' | 'propionate' | 'acetate' }> {
    const scfaProducers: Array<{ species: string; abundance: number; scfaType: 'butyrate' | 'propionate' | 'acetate' }> = [];

    // Butyrate producers
    const butyrateProducers = ['Faecalibacterium', 'Roseburia', 'Eubacterium', 'Clostridium butyricum'];
    // Propionate producers
    const propionateProducers = ['Bacteroides', 'Prevotella', 'Veillonella'];
    // Acetate producers
    const acetateProducers = ['Bifidobacterium', 'Lactobacillus', 'Akkermansia'];

    for (const s of species) {
      const name = (s.species || '').toLowerCase();
      const abundance = s.abundance || 0;

      if (butyrateProducers.some(p => name.includes(p.toLowerCase()))) {
        scfaProducers.push({ species: s.species || 'Unknown', abundance, scfaType: 'butyrate' });
      } else if (propionateProducers.some(p => name.includes(p.toLowerCase()))) {
        scfaProducers.push({ species: s.species || 'Unknown', abundance, scfaType: 'propionate' });
      } else if (acetateProducers.some(p => name.includes(p.toLowerCase()))) {
        scfaProducers.push({ species: s.species || 'Unknown', abundance, scfaType: 'acetate' });
      }
    }

    return scfaProducers;
  }
}

export const microbiomeAnalyzer = new MicrobiomeAnalyzer();

