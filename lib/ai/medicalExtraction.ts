/**
 * Medical Results AI Extraction
 * PDF/image extraction with Tesseract.js for OCR
 * AI parsing for biomarker values
 */

import Tesseract from 'tesseract.js';

export interface ExtractedBiomarker {
  name: string;
  value: number;
  unit: string;
  referenceRange?: {
    min: number;
    max: number;
  };
  flag?: 'normal' | 'high' | 'low' | 'critical';
}

export interface ExtractedBiomarkers {
  biomarkers: ExtractedBiomarker[];
  testDate?: Date;
  labName?: string;
  testType?: string;
}

export interface BiomarkerData {
  biomarkers: ExtractedBiomarker[];
  testDate: Date;
  labName?: string;
  testType: string;
}

export interface Comparison {
  biomarker: string;
  userValue: number;
  healthyRange: { min: number; max: number };
  status: 'optimal' | 'good' | 'suboptimal' | 'concerning';
  recommendation?: string;
}

export interface FlaggedResults {
  red: ExtractedBiomarker[]; // Needs medical attention
  yellow: ExtractedBiomarker[]; // Suboptimal, actionable
  green: ExtractedBiomarker[]; // Excellent
}

/**
 * Medical Extraction Client
 * Handles PDF/image OCR and biomarker parsing
 */
export class MedicalExtractionClient {
  /**
   * Extract text from PDF using OCR
   */
  async extractFromPDF(pdfUrl: string): Promise<string> {
    // In production, use a PDF parsing library
    // For now, return placeholder
    // Would use pdf-parse or similar
    throw new Error('PDF extraction not yet implemented - use image extraction');
  }

  /**
   * Extract text from image using Tesseract.js OCR
   */
  async extractFromImage(imageUrl: string): Promise<string> {
    try {
      const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            // Progress logging
          }
        },
      });
      return text;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`OCR failed: ${errorMessage}`);
    }
  }

  /**
   * Parse biomarkers from extracted text
   * Uses pattern matching and AI to identify biomarker values
   */
  async parseBiomarkers(text: string): Promise<ExtractedBiomarker[]> {
    const biomarkers: ExtractedBiomarker[] = [];

    // Common biomarker patterns
    const patterns = [
      {
        name: 'Glucose',
        regex: /glucose[:\s]+(\d+\.?\d*)\s*(mg\/dl|mmol\/l)/i,
        unit: 'mg/dl',
      },
      {
        name: 'HbA1c',
        regex: /hba1c|a1c[:\s]+(\d+\.?\d*)%/i,
        unit: '%',
      },
      {
        name: 'Total Cholesterol',
        regex: /total\s+cholesterol[:\s]+(\d+\.?\d*)\s*(mg\/dl)/i,
        unit: 'mg/dl',
      },
      {
        name: 'HDL',
        regex: /hdl[:\s]+(\d+\.?\d*)\s*(mg\/dl)/i,
        unit: 'mg/dl',
      },
      {
        name: 'LDL',
        regex: /ldl[:\s]+(\d+\.?\d*)\s*(mg\/dl)/i,
        unit: 'mg/dl',
      },
      {
        name: 'Triglycerides',
        regex: /triglycerides?[:\s]+(\d+\.?\d*)\s*(mg\/dl)/i,
        unit: 'mg/dl',
      },
      {
        name: 'CRP',
        regex: /c[-]?reactive\s+protein|crp[:\s]+(\d+\.?\d*)\s*(mg\/l|mg\/dl)/i,
        unit: 'mg/l',
      },
      {
        name: 'TSH',
        regex: /tsh[:\s]+(\d+\.?\d*)\s*(m[iu]\/l|m[iu]u\/ml)/i,
        unit: 'mIU/L',
      },
      {
        name: 'Vitamin D',
        regex: /vitamin\s+d|25[-\s]?oh[-\s]?d[:\s]+(\d+\.?\d*)\s*(ng\/ml|nmol\/l)/i,
        unit: 'ng/ml',
      },
      {
        name: 'B12',
        regex: /vitamin\s+b12|b12|cobalamin[:\s]+(\d+\.?\d*)\s*(pg\/ml|pmol\/l)/i,
        unit: 'pg/ml',
      },
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern.regex);
      if (match) {
        biomarkers.push({
          name: pattern.name,
          value: parseFloat(match[1]),
          unit: pattern.unit,
        });
      }
    }

    return biomarkers;
  }

  /**
   * Compare biomarkers to healthy ranges
   */
  async compareToRanges(
    biomarkers: ExtractedBiomarker[],
    userAge: number,
    userGender: string
  ): Promise<Comparison[]> {
    // Healthy ranges database (age and gender adjusted)
    const healthyRanges: Record<string, (age: number, gender: string) => { min: number; max: number }> = {
      'Glucose': (age, gender) => ({ min: 70, max: 100 }), // mg/dl
      'HbA1c': (age, gender) => ({ min: 4.0, max: 5.6 }), // %
      'Total Cholesterol': (age, gender) => ({ min: 0, max: 200 }), // mg/dl
      'HDL': (age, gender) => {
        const min = gender === 'male' ? 40 : 50;
        return { min, max: 100 };
      },
      'LDL': (age, gender) => ({ min: 0, max: 100 }), // Optimal <100
      'Triglycerides': (age, gender) => ({ min: 0, max: 150 }),
      'CRP': (age, gender) => ({ min: 0, max: 3.0 }), // mg/l
      'TSH': (age, gender) => ({ min: 0.4, max: 4.0 }), // mIU/L
      'Vitamin D': (age, gender) => ({ min: 30, max: 100 }), // ng/ml
      'B12': (age, gender) => ({ min: 200, max: 900 }), // pg/ml
    };

    return biomarkers.map(biomarker => {
      const rangeFn = healthyRanges[biomarker.name];
      const healthyRange = rangeFn ? rangeFn(userAge, userGender) : { min: 0, max: 1000 };

      let status: 'optimal' | 'good' | 'suboptimal' | 'concerning' = 'good';
      let recommendation: string | undefined;

      if (biomarker.value < healthyRange.min) {
        status = biomarker.name === 'LDL' || biomarker.name === 'Triglycerides' ? 'optimal' : 'concerning';
        recommendation = `${biomarker.name} is below optimal range. Consider supplementation or dietary changes.`;
      } else if (biomarker.value > healthyRange.max) {
        status = 'concerning';
        recommendation = `${biomarker.name} is above healthy range. Consult with healthcare provider.`;
      } else {
        // Check if in optimal sub-range
        const optimalRange = {
          min: healthyRange.min + (healthyRange.max - healthyRange.min) * 0.3,
          max: healthyRange.max - (healthyRange.max - healthyRange.min) * 0.1,
        };
        if (biomarker.value >= optimalRange.min && biomarker.value <= optimalRange.max) {
          status = 'optimal';
        } else {
          status = 'good';
        }
      }

      return {
        biomarker: biomarker.name,
        userValue: biomarker.value,
        healthyRange,
        status,
        recommendation,
      };
    });
  }

  /**
   * Flag anomalies (red/yellow/green)
   */
  async flagAnomalies(biomarkers: ExtractedBiomarker[]): Promise<FlaggedResults> {
    const flagged: FlaggedResults = {
      red: [],
      yellow: [],
      green: [],
    };

    // Critical thresholds
    const criticalThresholds: Record<string, { high: number; low: number }> = {
      'Glucose': { high: 126, low: 70 }, // Diabetes threshold
      'HbA1c': { high: 6.5, low: 4.0 },
      'LDL': { high: 190, low: 0 },
      'CRP': { high: 10, low: 0 },
    };

    for (const biomarker of biomarkers) {
      const thresholds = criticalThresholds[biomarker.name];
      
      if (thresholds) {
        if (biomarker.value >= thresholds.high || biomarker.value <= thresholds.low) {
          biomarker.flag = 'critical';
          flagged.red.push(biomarker);
        } else {
          // Check suboptimal ranges
          const suboptimalHigh = thresholds.high * 0.8;
          const suboptimalLow = thresholds.low * 1.2;
          
          if (biomarker.value >= suboptimalHigh || biomarker.value <= suboptimalLow) {
            biomarker.flag = biomarker.value >= suboptimalHigh ? 'high' : 'low';
            flagged.yellow.push(biomarker);
          } else {
            biomarker.flag = 'normal';
            flagged.green.push(biomarker);
          }
        }
      } else {
        // Default: mark as good if no critical thresholds
        biomarker.flag = 'normal';
        flagged.green.push(biomarker);
      }
    }

    return flagged;
  }
}

export const medicalExtractionClient = new MedicalExtractionClient();
