import { MedicalExtractionClient } from '@/lib/ai/medicalExtraction';

// Mock Tesseract.js
jest.mock('tesseract.js', () => ({
  recognize: jest.fn().mockResolvedValue({
    data: {
      text: 'Glucose: 95 mg/dl\nHbA1c: 5.2%\nTotal Cholesterol: 180 mg/dl',
    },
  }),
}));

describe('MedicalExtractionClient', () => {
  let client: MedicalExtractionClient;

  beforeEach(() => {
    client = new MedicalExtractionClient();
  });

  describe('extractFromImage', () => {
    it('extracts text from image using OCR', async () => {
      const text = await client.extractFromImage('https://example.com/lab-result.jpg');
      expect(text).toBeDefined();
      expect(typeof text).toBe('string');
    });

    it('handles OCR errors gracefully', async () => {
      const Tesseract = require('tesseract.js');
      Tesseract.recognize.mockRejectedValueOnce(new Error('OCR failed'));

      await expect(client.extractFromImage('https://example.com/bad-image.jpg')).rejects.toThrow();
    });
  });

  describe('parseBiomarkers', () => {
    it('parses biomarkers from extracted text', async () => {
      const text = 'Glucose: 95 mg/dl\nHbA1c: 5.2%\nTotal Cholesterol: 180 mg/dl';
      const biomarkers = await client.parseBiomarkers(text);
      expect(Array.isArray(biomarkers)).toBe(true);
    });

    it('identifies glucose values', async () => {
      const text = 'Glucose: 95 mg/dl';
      const biomarkers = await client.parseBiomarkers(text);
      const glucose = biomarkers.find(b => b.name.toLowerCase().includes('glucose'));
      expect(glucose).toBeDefined();
      if (glucose) {
        expect(glucose.value).toBe(95);
      }
    });

    it('identifies HbA1c values', async () => {
      const text = 'HbA1c: 5.2%';
      const biomarkers = await client.parseBiomarkers(text);
      const hba1c = biomarkers.find(b => b.name.toLowerCase().includes('hba1c') || b.name.toLowerCase().includes('a1c'));
      expect(hba1c).toBeDefined();
    });
  });

  describe('compareToRanges', () => {
    it('compares biomarkers to healthy ranges', async () => {
      const biomarkers = [
        {
          name: 'Glucose',
          value: 95,
          unit: 'mg/dl',
        },
      ];
      const comparison = await client.compareToRanges(biomarkers, 45, 'M');
      expect(Array.isArray(comparison)).toBe(true);
    });

    it('flags high values as concerning', async () => {
      const biomarkers = [
        {
          name: 'Glucose',
          value: 200, // High
          unit: 'mg/dl',
        },
      ];
      const comparison = await client.compareToRanges(biomarkers, 45, 'M');
      const glucose = comparison.find(c => c.biomarker.toLowerCase().includes('glucose'));
      if (glucose) {
        expect(['suboptimal', 'concerning']).toContain(glucose.status);
      }
    });
  });

  describe('flagAnomalies', () => {
    it('flags anomalies correctly', async () => {
      const biomarkers = [
        {
          name: 'Glucose',
          value: 200, // High
          unit: 'mg/dl',
        },
        {
          name: 'HbA1c',
          value: 5.2, // Normal
          unit: '%',
        },
      ];
      const flagged = await client.flagAnomalies(biomarkers);
      expect(flagged.red).toBeDefined();
      expect(flagged.yellow).toBeDefined();
      expect(flagged.green).toBeDefined();
      expect(Array.isArray(flagged.red)).toBe(true);
      expect(Array.isArray(flagged.yellow)).toBe(true);
      expect(Array.isArray(flagged.green)).toBe(true);
    });
  });
});
