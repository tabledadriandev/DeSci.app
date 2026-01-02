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
  rawData: Record<string, unknown>;
  
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
  private parseViomeData(rawData: unknown): ProcessedMicrobiomeResult {
    // Viome typically provides:
    // - Species composition with abundance
    // - Metabolic activity scores
    // - Pathogen detection
    
    const rawDataTyped = rawData as { species?: unknown[]; bacteria?: unknown[]; pathogens?: unknown[]; concerningBacteria?: unknown[] };
    const species = (rawDataTyped.species || rawDataTyped.bacteria || []) as Array<{ species?: string; abundance: number; name?: string }>;
    const diversity = this.calculateDiversity(species);
    const phyla = this.calculatePhylaDistribution(species);
    const beneficial = this.identifyBeneficialBacteria(species);
    const pathogens = this.identifyPathogens((rawDataTyped.pathogens || rawDataTyped.concerningBacteria || []) as Array<{ presence?: boolean; level?: string; name?: string }>);
    
    return {
      shannonIndex: diversity.shannon,
      simpsonIndex: diversity.simpson,
      speciesRichness: diversity.richness,
      ...phyla,
      ...beneficial,
      pathogens,
      inflammationRisk: this.calculateInflammationRisk(species, (rawDataTyped as { inflammationMarkers?: Record<string, unknown> }).inflammationMarkers),
      gutPermeabilityRisk: this.calculateGutPermeabilityRisk(species),
      digestionScore: this.calculateDigestionScore(species),
    };
  }

  /**
   * Parse Ombre (formerly Thryve) test results
   */
  private parseOmbreData(rawData: unknown): ProcessedMicrobiomeResult {
    const rawDataTyped = rawData as { bacteria?: unknown[]; species?: unknown[] };
    const species = (rawDataTyped.bacteria || rawDataTyped.species || []) as Array<{ species?: string; abundance: number; name?: string }>;
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
  private parseTinyHealthData(rawData: unknown): ProcessedMicrobiomeResult {
    const rawDataTyped = rawData as { composition?: unknown[]; species?: unknown[] };
    const species = (rawDataTyped.composition || rawDataTyped.species || []) as Array<{ species?: string; abundance: number; name?: string }>;
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
  private parseThorneData(rawData: unknown): ProcessedMicrobiomeResult {
    const rawDataTyped = rawData as { microbiome?: unknown[]; bacteria?: unknown[] };
    const species = (rawDataTyped.microbiome || rawDataTyped.bacteria || []) as Array<{ species?: string; abundance: number; name?: string }>;
    const diversity = this.calculateDiversity(species);
    const phyla = this.calculatePhylaDistribution(species);
    const beneficial = this.identifyBeneficialBacteria(species);
    const pathogens = this.identifyPathogens(((rawDataTyped as { pathogens?: unknown[] }).pathogens || []) as Array<{ presence?: boolean; level?: string; name?: string }>);
    
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
  private parseManualData(rawData: unknown): ProcessedMicrobiomeResult {
    // Manual entry should have already formatted data
    const rawDataTyped = rawData as { 
      shannonIndex?: number; simpsonIndex?: number; speciesRichness?: number; 
      firmicutesPercentage?: number; bacteroidetesPercentage?: number; 
      actinobacteriaPercentage?: number; proteobacteriaPercentage?: number; 
      verrucomicrobiaPercentage?: number; otherPercentage?: number;
      akkermansiaMuciniphila?: number; bifidobacterium?: number; lactobacillus?: number;
      faecalibacteriumPrausnitzii?: number; pathogens?: unknown[]; 
      inflammationRisk?: number; gutPermeabilityRisk?: number; digestionScore?: number;
    };
    return {
      shannonIndex: rawDataTyped.shannonIndex || 0,
      simpsonIndex: rawDataTyped.simpsonIndex,
      speciesRichness: rawDataTyped.speciesRichness,
      firmicutesPercentage: rawDataTyped.firmicutesPercentage || 0,
      bacteroidetesPercentage: rawDataTyped.bacteroidetesPercentage || 0,
      actinobacteriaPercentage: rawDataTyped.actinobacteriaPercentage || 0,
      proteobacteriaPercentage: rawDataTyped.proteobacteriaPercentage || 0,
      verrucomicrobiaPercentage: rawDataTyped.verrucomicrobiaPercentage || 0,
      otherPercentage: rawDataTyped.otherPercentage || 0,
      akkermansiaMuciniphila: rawDataTyped.akkermansiaMuciniphila,
      bifidobacterium: rawDataTyped.bifidobacterium,
      lactobacillus: rawDataTyped.lactobacillus,
      faecalibacteriumPrausnitzii: rawDataTyped.faecalibacteriumPrausnitzii,
      pathogens: rawDataTyped.pathogens ? (rawDataTyped.pathogens as Array<{ presence?: boolean; level?: string; name?: string }>).map(p => ({
        name: p.name || '',
        presence: p.presence || false,
        level: (p.level === 'high' || p.level === 'medium' || p.level === 'low' ? p.level : 'low') as 'high' | 'medium' | 'low'
      })) : undefined,
      inflammationRisk: rawDataTyped.inflammationRisk,
      gutPermeabilityRisk: rawDataTyped.gutPermeabilityRisk,
      digestionScore: rawDataTyped.digestionScore,
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

    return beneficial as { akkermansiaMuciniphila?: number; bifidobacterium?: number; lactobacillus?: number; faecalibacteriumPrausnitzii?: number };
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
    inflammationMarkers?: Record<string, unknown>
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

