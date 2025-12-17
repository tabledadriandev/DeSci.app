'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, TrendingUp, AlertCircle, Sparkles, CheckCircle, Brain } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProgressBar from '@/components/ui/ProgressBar';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

export default function HealthReportsPage() {
  const { address } = useAccount();
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('comprehensive');

  useEffect(() => {
    // Mock data for reports
    setReports([
      { id: '1', reportType: 'comprehensive', reportDate: new Date(Date.now() - 86400000 * 30).toISOString(), healthScore: 78, keyFindings: ["Elevated LDL cholesterol", "Vitamin D deficiency"], recommendations: ["Increase fiber intake", "Sun exposure"] },
      { id: '2', reportType: 'monthly', reportDate: new Date(Date.now() - 86400000 * 60).toISOString(), healthScore: 75, keyFindings: ["Improved sleep scores"], recommendations: ["Continue consistent sleep schedule"] },
    ]);
  }, [address]);

  const generateReport = async () => {
    if (!address) return;
    setGenerating(true);

    // Mock report generation
    setTimeout(() => {
      const newReport = {
        id: String(reports.length + 1),
        reportType,
        reportDate: new Date().toISOString(),
        healthScore: 60 + Math.random() * 30, // Random score
        keyFindings: ["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit"],
        recommendations: ["Sed do eiusmod tempor", "Incididunt ut labore et dolore"],
        pdfUrl: '#', // Placeholder for actual PDF
      };
      setReports((prev) => [newReport, ...prev]);
      setGenerating(false);
      alert('Report generated! (Mock)');
    }, 2000);
  };

  const downloadReport = (report: any) => {
    alert(`Downloading report for ${report.reportType} dated ${new Date(report.reportDate).toLocaleDateString()}`);
    // Simulate download
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
              Health Reports
            </h1>
            <p className="text-base text-text-secondary max-w-2xl">
              Generate and review detailed insights into your health and wellness journey.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
            <AnimatedButton
              onClick={generateReport}
              disabled={generating}
              icon={<FileText className="w-5 h-5" />}
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </AnimatedButton>
          </div>
        </motion.div>

        {reports.length === 0 ? (
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card p-12 text-center my-8">
            <Brain className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">No Reports Yet</h2>
            <p className="text-text-secondary mb-6">
              Generate your first comprehensive health report to see detailed insights about your health.
            </p>
            <AnimatedButton
              onClick={generateReport}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate First Report'}
            </AnimatedButton>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {reports.map((report) => (
              <motion.div key={report.id} variants={fadeInUp} className="glass-card-hover p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-1">
                      {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report
                    </h3>
                    <p className="flex items-center gap-2 text-sm text-text-tertiary">
                      <Calendar className="w-4 h-4" /> {new Date(report.reportDate).toLocaleDateString()}
                    </p>
                  </div>
                  <AnimatedButton
                    onClick={() => downloadReport(report)}
                    variant="ghost"
                    size="sm"
                    icon={<Download className="w-5 h-5" />}
                  />
                </div>

                {/* Health Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-text-secondary">Health Score</p>
                    <p className={`text-2xl font-bold ${
                      report.healthScore >= 80 ? 'text-semantic-success' :
                      report.healthScore >= 60 ? 'text-semantic-warning' : 'text-semantic-error'
                    }`}>
                      {Math.round(report.healthScore)}
                    </p>
                  </div>
                  <ProgressBar
                    value={report.healthScore}
                    max={100}
                    color={report.healthScore >= 80 ? 'success' : report.healthScore >= 60 ? 'warning' : 'error'}
                    size="md"
                    animated
                    showValue={false}
                  />
                </div>

                {/* Key Findings */}
                {report.keyFindings && report.keyFindings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-base font-semibold text-text-primary mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-semantic-warning" /> Key Findings
                    </h4>
                    <ul className="space-y-1 text-sm text-text-secondary">
                      {report.keyFindings.slice(0, 3).map((finding: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-accent-primary mt-1">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {report.recommendations && report.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold text-text-primary mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-semantic-success" /> Recommendations
                    </h4>
                    <ul className="space-y-1 text-sm text-text-secondary">
                      {report.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-semantic-success mt-1">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Progress Comparison */}
                {report.progressComparison && (
                  <div className="mt-4 pt-4 border-t border-border-medium">
                    <h4 className="text-base font-semibold text-text-primary mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent-secondary" /> Progress Comparison
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {report.progressComparison.summary || 'Compare with previous reports'}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

