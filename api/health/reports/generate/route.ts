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
      include: {
        profile: true,
        healthAssessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        healthScores: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        biomarkers: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        symptomLogs: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const assessment = user.healthAssessments[0];
    const healthScore = user.healthScores[0];

    if (!assessment || !healthScore) {
      return NextResponse.json(
        { error: 'Please complete a health assessment first' },
        { status: 400 }
      );
    }

    // Generate report data
    const reportData = generateReportData(user, assessment, healthScore, reportType);

    // Generate PDF
    const pdfData = await generatePDF(reportData);

    // Save report
    const report = await prisma.healthReport.create({
      data: {
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
        pdfData: pdfData,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}

function generateReportData(user: any, assessment: any, healthScore: any, reportType: string) {
  const keyFindings: string[] = [];
  const recommendations: string[] = [];

  // Analyze health score
  if (healthScore.overallScore < 60) {
    keyFindings.push('Overall health score indicates areas for improvement');
    recommendations.push('Focus on lifestyle modifications to improve health score');
  } else if (healthScore.overallScore >= 80) {
    keyFindings.push('Excellent overall health score');
  }

  // Analyze risk scores
  if (assessment.heartDiseaseRisk && assessment.heartDiseaseRisk > 30) {
    keyFindings.push(`Elevated heart disease risk: ${assessment.heartDiseaseRisk.toFixed(1)}%`);
    recommendations.push('Consider cardiovascular monitoring and lifestyle changes');
  }

  if (assessment.diabetesRisk && assessment.diabetesRisk > 30) {
    keyFindings.push(`Elevated diabetes risk: ${assessment.diabetesRisk.toFixed(1)}%`);
    recommendations.push('Monitor blood glucose and focus on nutrition');
  }

  // Analyze biomarkers
  const recentBiomarkers = user.biomarkers.slice(0, 5);
  const abnormalBiomarkers = recentBiomarkers.filter((b: any) => {
    // Check for abnormal values (simplified)
    if (b.bloodPressureSystolic && b.bloodPressureSystolic > 120) return true;
    if (b.bloodGlucose && b.bloodGlucose > 100) return true;
    if (b.cholesterolTotal && b.cholesterolTotal > 200) return true;
    return false;
  });

  if (abnormalBiomarkers.length > 0) {
    keyFindings.push(`${abnormalBiomarkers.length} biomarker(s) outside optimal range`);
    recommendations.push('Review biomarker trends with healthcare provider');
  }

  // Analyze symptoms
  const recentSymptoms = user.symptomLogs.slice(0, 7);
  const lowEnergyDays = recentSymptoms.filter((s: any) => s.energyLevel && s.energyLevel < 5).length;
  if (lowEnergyDays > 3) {
    keyFindings.push('Frequent low energy days detected');
    recommendations.push('Focus on sleep quality and stress management');
  }

  // Executive Summary
  const executiveSummary = {
    overallHealth: healthScore.overallScore >= 80 ? 'Excellent' :
                   healthScore.overallScore >= 60 ? 'Good' : 'Needs Improvement',
    primaryConcerns: keyFindings.slice(0, 3),
    nextSteps: recommendations.slice(0, 3),
    assessmentDate: assessment.completedAt,
  };

  // Risk Assessment
  const riskAssessment = {
    heartDisease: assessment.heartDiseaseRisk || 0,
    diabetes: assessment.diabetesRisk || 0,
    hypertension: assessment.hypertensionRisk || 0,
    stroke: assessment.strokeRisk || 0,
    metabolicSyndrome: assessment.metabolicSyndromeRisk || 0,
    overall: assessment.overallRiskScore || 0,
  };

  // Progress Comparison (if previous report exists)
  const progressComparison = {
    summary: 'First report - establish baseline',
    improvements: [],
    areasToWatch: keyFindings.slice(0, 3),
  };

  return {
    executiveSummary,
    healthScore: healthScore.overallScore,
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

async function generatePDF(reportData: any): Promise<string> {
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

