'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

export default function HealthReportsPage() {
  const { address } = useAccount();
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('comprehensive');

  useEffect(() => {
    if (address) {
      loadReports();
    }
  }, [address]);

  const loadReports = async () => {
    try {
      const response = await fetch(`/api/health/reports?userId=${address}`);
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const generateReport = async () => {
    if (!address) return;
    setGenerating(true);

    try {
      const response = await fetch('/api/health/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          reportType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await loadReports();
        // Auto-download the PDF
        if (data.report.pdfUrl) {
          window.open(data.report.pdfUrl, '_blank');
        } else if (data.report.pdfData) {
          // Download base64 PDF
          const link = document.createElement('a');
          link.href = `data:application/pdf;base64,${data.report.pdfData}`;
          link.download = `health-report-${new Date().toISOString().split('T')[0]}.pdf`;
          link.click();
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = (report: any) => {
    if (report.pdfUrl) {
      window.open(report.pdfUrl, '_blank');
    } else if (report.pdfData) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${report.pdfData}`;
      link.download = `health-report-${new Date(report.reportDate).toISOString().split('T')[0]}.pdf`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-accent-primary">
            Health Reports
          </h1>
          <div className="flex items-center gap-4">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
            <button
              onClick={generateReport}
              disabled={generating}
              className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Report Preview Cards */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-display mb-2">No Reports Yet</h2>
            <p className="text-text-secondary mb-6">
              Generate your first comprehensive health report to see detailed insights about your health.
            </p>
            <button
              onClick={generateReport}
              disabled={generating}
              className="px-8 py-4 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate First Report'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-display text-accent-primary mb-1">
                      {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Calendar className="w-4 h-4" />
                      {new Date(report.reportDate).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => downloadReport(report)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Download className="w-5 h-5 text-accent-primary" />
                  </button>
                </div>

                {/* Health Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Health Score</span>
                    <span className={`text-2xl font-bold ${
                      report.healthScore >= 80 ? 'text-green-600' :
                      report.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(report.healthScore)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        report.healthScore >= 80 ? 'bg-green-500' :
                        report.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, report.healthScore)}%` }}
                    />
                  </div>
                </div>

                {/* Key Findings */}
                {report.keyFindings && report.keyFindings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Key Findings
                    </h4>
                    <ul className="space-y-1">
                      {report.keyFindings.slice(0, 3).map((finding: string, idx: number) => (
                        <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
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
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {report.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm text-text-secondary flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Progress Comparison */}
                {report.progressComparison && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold mb-2">Progress</h4>
                    <div className="text-xs text-text-secondary">
                      {report.progressComparison.summary || 'Compare with previous reports'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

