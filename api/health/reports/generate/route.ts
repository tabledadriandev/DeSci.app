import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsPDF } from 'jspdf';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, reportType } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { email: userId },
        ],
      },
      // TODO: HealthAssessments, healthScores, biomarkers, symptomLogs relations not yet implemented
      // Fetch separately if needed
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch health score separately
    const healthScore = await prisma.healthScore.findFirst({
      where: { userId: user.id },
      orderBy: { calculatedAt: 'desc' },
    });

    // Fetch biomarker readings separately
    const biomarkers = await prisma.biomarkerReading.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 10,
    });

    if (!healthScore) {
      return NextResponse.json(
        { error: 'Please complete a health assessment first' },
        { status: 400 }
      );
    }

    // TODO: HealthAssessment model not yet implemented
    const assessment = null;

    // Generate report data
    const reportData = generateReportData(user, assessment, healthScore, biomarkers, reportType);

    // Generate PDF
    const pdfData = await generatePDF(reportData);

    // TODO: HealthReport model not yet implemented
    // For now, return without saving to database
    const report = {
      id: 'temp',
      userId: user.id,
      reportType: reportType || 'comprehensive',
      reportDate: new Date(),
      executiveSummary: reportData.executiveSummary,
      healthScore: reportData.healthScore,
      keyFindings: reportData.keyFindings,
      biomarkers: reportData.biomarkers,
      riskAssessment: reportData.riskAssessment,
      recommendations: reportData.recommendations,
      progressComparison: reportData.progressComparison,
    };

    return NextResponse.json({ success: true, report, pdfData });
  } catch (error: unknown) {
    console.error('Error generating report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
    return NextResponse.json(
      { error: 'Failed to generate report', details: errorMessage },
      { status: 500 }
    );
  }
}

function generateReportData(user: unknown, assessment: unknown, healthScore: { score: number }, biomarkers: Array<{ metric: string; value: number }>, reportType: string) {
  const keyFindings: string[] = [];
  const recommendations: string[] = [];

  // Analyze health score
  if (healthScore.score < 60) {
    keyFindings.push('Overall health score indicates areas for improvement');
    recommendations.push('Focus on lifestyle modifications to improve health score');
  } else if (healthScore.score >= 80) {
    keyFindings.push('Excellent overall health score');
  }

  // Analyze risk scores (assessment not yet implemented)
  // if (assessment && assessment.heartDiseaseRisk && assessment.heartDiseaseRisk > 30) {
  //   keyFindings.push(`Elevated heart disease risk: ${assessment.heartDiseaseRisk.toFixed(1)}%`);
  //   recommendations.push('Consider cardiovascular monitoring and lifestyle changes');
  // }

  // Analyze biomarkers
  const recentBiomarkers = biomarkers.slice(0, 5);
  const abnormalBiomarkers = recentBiomarkers.filter((b) => {
    // Check for abnormal values based on metric and value
    if (b.metric === 'bloodGlucose' && b.value > 100) return true;
    if (b.metric === 'cholesterolTotal' && b.value > 200) return true;
    return false;
  });

  if (abnormalBiomarkers.length > 0) {
    keyFindings.push(`${abnormalBiomarkers.length} biomarker(s) outside optimal range`);
    recommendations.push('Review biomarker trends with healthcare provider');
  }

  // Executive Summary
  const executiveSummary = {
    overallHealth: healthScore.score >= 80 ? 'Excellent' :
                   healthScore.score >= 60 ? 'Good' : 'Needs Improvement',
    primaryConcerns: keyFindings.slice(0, 3),
    nextSteps: recommendations.slice(0, 3),
    assessmentDate: new Date().toISOString(),
  };

  // Risk Assessment (default values since assessment not implemented)
  const riskAssessment = {
    heartDisease: 0,
    diabetes: 0,
    hypertension: 0,
    stroke: 0,
    metabolicSyndrome: 0,
    overall: 0,
  };

  // Progress Comparison (if previous report exists)
  const progressComparison = {
    summary: 'First report - establish baseline',
    improvements: [],
    areasToWatch: keyFindings.slice(0, 3),
  };

  return {
    executiveSummary,
    healthScore: healthScore.score,
    keyFindings,
    biomarkers: {
      recent: recentBiomarkers,
      summary: `Tracked ${recentBiomarkers.length} recent biomarker entries`,
    },
    riskAssessment,
    recommendations,
    progressComparison,
  };
}

async function generatePDF(reportData: {
  executiveSummary: {
    overallHealth: string;
    primaryConcerns: string[];
    nextSteps: string[];
    assessmentDate: string;
  };
  healthScore: number;
  keyFindings: string[];
  biomarkers: {
    recent: Array<{ metric: string; value: number }>;
    summary: string;
  };
  riskAssessment: {
    heartDisease: number;
    diabetes: number;
    hypertension: number;
    stroke: number;
    metabolicSyndrome: number;
    overall: number;
  };
  recommendations: string[];
  progressComparison: {
    summary: string;
    improvements: string[];
    areasToWatch: string[];
  };
}): Promise<string> {
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(24);
  doc.setTextColor(212, 175, 55); // accent-primary color
  doc.text('Health Report', 105, yPos, { align: 'center' });
  yPos += 15;

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });
  yPos += 20;

  // Executive Summary
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Executive Summary', 20, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.text(`Overall Health: ${reportData.executiveSummary.overallHealth}`, 20, yPos);
  yPos += 7;
  doc.text(`Health Score: ${Math.round(reportData.healthScore)}/100`, 20, yPos);
  yPos += 10;

  // Key Findings
  doc.setFontSize(14);
  doc.text('Key Findings', 20, yPos);
  yPos += 8;
  doc.setFontSize(10);
  reportData.keyFindings.slice(0, 5).forEach((finding: string) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`• ${finding}`, 25, yPos);
    yPos += 6;
  });
  yPos += 5;

  // Risk Assessment
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  doc.setFontSize(14);
  doc.text('Risk Assessment', 20, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.text(`Heart Disease Risk: ${reportData.riskAssessment.heartDisease.toFixed(1)}%`, 20, yPos);
  yPos += 6;
  doc.text(`Diabetes Risk: ${reportData.riskAssessment.diabetes.toFixed(1)}%`, 20, yPos);
  yPos += 6;
  doc.text(`Hypertension Risk: ${reportData.riskAssessment.hypertension.toFixed(1)}%`, 20, yPos);
  yPos += 6;
  doc.text(`Stroke Risk: ${reportData.riskAssessment.stroke.toFixed(1)}%`, 20, yPos);
  yPos += 10;

  // Recommendations
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  doc.setFontSize(14);
  doc.text('Recommendations', 20, yPos);
  yPos += 8;
  doc.setFontSize(10);
  reportData.recommendations.slice(0, 8).forEach((rec: string) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`• ${rec}`, 25, yPos);
    yPos += 6;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Table d'Adrian Wellness - Page ${i} of ${pageCount}`,
      105,
      285,
      { align: 'center' }
    );
  }

  // Convert to base64
  const pdfBase64 = doc.output('datauristring').split(',')[1];
  return pdfBase64;
}

