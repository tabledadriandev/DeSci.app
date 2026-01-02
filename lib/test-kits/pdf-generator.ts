/**
 * PDF Generation for Lab Results
 * Generates comprehensive PDF reports for test results
 */

import { prisma } from '@/lib/prisma';

export interface PDFReportOptions {
  includeTrends?: boolean;
  includeRecommendations?: boolean;
  includeReferenceRanges?: boolean;
  format?: 'detailed' | 'summary';
}

interface UserData {
  name?: string;
  email?: string;
  [key: string]: unknown;
}

interface TestResult {
  testName?: string;
  testType?: string;
  processingCompletedAt?: Date | string;
  provider?: string;
  resultsData?: Record<string, unknown>;
  recommendations?: string[];
  [key: string]: unknown;
}

export class LabResultsPDFGenerator {
  /**
   * Generate PDF report for test results
   */
  async generateReport(
    userId: string,
    testResultIds: string[],
    options: PDFReportOptions = {}
  ): Promise<Buffer> {
    // Get test results
    // TODO: TestOrder and TestKit models not yet implemented
    // MedicalResult doesn't have order relation
    const testResults = await prisma.medicalResult.findMany({
      where: {
        id: { in: testResultIds },
        userId,
      },
    });

    if (testResults.length === 0) {
      throw new Error('No test results found');
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Get historical biomarkers for trends if requested
    let trends: unknown[] = [];
    if (options.includeTrends) {
      const biomarkers = await prisma.biomarkerReading.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
      });
      trends = biomarkers;
    }

    // Generate PDF content
    if (!user) {
      throw new Error('User not found');
    }
    const userData: UserData = {
      name: user.name || undefined,
      email: user.email || undefined,
      username: user.username || undefined,
      walletAddress: user.walletAddress || undefined,
      avatar: user.avatar || undefined,
      biologicalAge: user.biologicalAge || undefined,
    };
    const pdfContent = this.buildPDFContent(testResults, userData, trends, options);

    // For now, return base64 encoded HTML (will be converted to PDF)
    // In production, use a PDF library like jsPDF or pdfkit
    return Buffer.from(pdfContent, 'utf-8');
  }

  /**
   * Build PDF content structure
   */
  private buildPDFContent(
    testResults: unknown[],
    user: UserData,
    trends: unknown[],
    options: PDFReportOptions
  ): string {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Lab Results Report - Table d'Adrian</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            .header {
              border-bottom: 2px solid #8B4513;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #8B4513;
              margin: 0;
            }
            .patient-info {
              margin-bottom: 30px;
            }
            .test-result {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            .test-result h2 {
              color: #8B4513;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .optimal { color: #22c55e; }
            .borderline { color: #eab308; }
            .concerning { color: #ef4444; }
            .recommendations {
              background-color: #f9fafb;
              padding: 15px;
              border-left: 4px solid #8B4513;
              margin-top: 20px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Table d'Adrian Wellness</h1>
            <p>Comprehensive Lab Results Report</p>
          </div>
          
          <div class="patient-info">
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${user?.name || 'N/A'}</p>
            <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${user?.email ? `<p><strong>Email:</strong> ${user.email}</p>` : ''}
          </div>
          
          ${testResults.map((result: unknown) => this.buildTestResultSection(result as TestResult, options)).join('')}
          
          ${options.includeRecommendations && trends.length > 0 ? this.buildTrendsSection(trends) : ''}
          
          <div class="footer">
            <p>This report is for informational purposes only and should not replace professional medical advice.</p>
            <p>Generated by Table d'Adrian Wellness Platform</p>
          </div>
        </body>
      </html>
    `;

    return html;
  }

  /**
   * Build test result section
   */
  private buildTestResultSection(result: TestResult, options: PDFReportOptions): string {
    const resultsData = result.resultsData || {};
    const recommendations = result.recommendations || [];

    return `
      <div class="test-result">
        <h2>${result.testName || result.testType}</h2>
        <p><strong>Test Date:</strong> ${result.processingCompletedAt ? new Date(result.processingCompletedAt).toLocaleDateString() : 'N/A'}</p>
        ${result.provider ? `<p><strong>Provider:</strong> ${result.provider}</p>` : ''}
        
        <table>
          <thead>
            <tr>
              <th>Biomarker</th>
              <th>Value</th>
              ${options.includeReferenceRanges ? '<th>Reference Range</th>' : ''}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${this.buildResultsTableRows(resultsData, options)}
          </tbody>
        </table>
        
        ${recommendations.length > 0 && options.includeRecommendations ? `
          <div class="recommendations">
            <h3>Recommendations</h3>
            <ul>
              ${recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Build results table rows
   */
  private buildResultsTableRows(resultsData: Record<string, unknown>, options: PDFReportOptions): string {
    const rows: string[] = [];
    const referenceRanges: Record<string, { min: number; max: number; unit: string }> = {
      bloodGlucose: { min: 70, max: 100, unit: 'mg/dL' },
      cholesterolTotal: { min: 0, max: 200, unit: 'mg/dL' },
      cholesterolLDL: { min: 0, max: 100, unit: 'mg/dL' },
      cholesterolHDL: { min: 40, max: 200, unit: 'mg/dL' },
      vitaminD: { min: 30, max: 100, unit: 'ng/mL' },
      // Add more reference ranges
    };

    for (const [key, value] of Object.entries(resultsData)) {
      if (typeof value === 'number') {
        const status = this.getStatus(value, key, referenceRanges);
        const range = referenceRanges[key];
        
        rows.push(`
          <tr>
            <td>${this.formatBiomarkerName(key)}</td>
            <td>${value} ${range?.unit || ''}</td>
            ${options.includeReferenceRanges ? `<td>${range ? `${range.min}-${range.max} ${range.unit}` : 'N/A'}</td>` : ''}
            <td class="${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</td>
          </tr>
        `);
      }
    }

    return rows.join('');
  }

  /**
   * Build trends section
   */
  private buildTrendsSection(trends: unknown[]): string {
    return `
      <div class="test-result">
        <h2>Biomarker Trends</h2>
        <p>Historical biomarker data shows trends over time. Review with your healthcare provider.</p>
        <!-- Trend charts would be rendered here -->
      </div>
    `;
  }

  /**
   * Format biomarker name for display
   */
  private formatBiomarkerName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Get status for a biomarker value
   */
  private getStatus(
    value: number,
    key: string,
    referenceRanges: Record<string, { min: number; max: number; unit: string }>
  ): 'optimal' | 'borderline' | 'concerning' {
    const range = referenceRanges[key];
    if (!range) return 'optimal';

    const { min, max } = range;
    const rangeSize = max - min;
    const optimalMin = min + rangeSize * 0.1;
    const optimalMax = max - rangeSize * 0.1;

    if (value >= optimalMin && value <= optimalMax) return 'optimal';
    if (value >= min && value <= max) return 'borderline';
    return 'concerning';
  }
}

export const labResultsPDFGenerator = new LabResultsPDFGenerator();

