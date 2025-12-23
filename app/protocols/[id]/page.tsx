/**
 * Protocol Detail Page
 * Shows timeline, correlations, and progress
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, BarChart3, Calendar, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import TimelineView from '@/components/biometrics/TimelineView';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

interface Protocol {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  status: string;
  adherence: number | null;
  correlatedMetrics: any;
  correlations?: Array<{
    metric: string;
    correlation: number;
    pValue: number;
    improvement: number;
    confidence: 'high' | 'medium' | 'low';
    sampleSize: number;
  }>;
  notes?: string;
}

export default function ProtocolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const protocolId = params.id as string;
  const [calculating, setCalculating] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['protocol', protocolId],
    queryFn: async () => {
      const res = await fetch(`/api/protocols/${protocolId}`);
      if (!res.ok) throw new Error('Failed to fetch protocol');
      const json = await res.json();
      return json.protocol as Protocol;
    },
  });

  const handleCalculateCorrelations = async () => {
    setCalculating(true);
    try {
      const res = await fetch(`/api/protocols/${protocolId}/correlations`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to calculate correlations');
      await refetch();
    } catch (error) {
      console.error('Correlation calculation error:', error);
      alert('Failed to calculate correlations');
    } finally {
      setCalculating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-text-secondary">Loading protocol...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-error">Protocol not found</p>
          <Link
            href="/protocols"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Back to Protocols
          </Link>
        </div>
      </div>
    );
  }

  const protocol = data;
  const daysElapsed = Math.floor(
    (new Date().getTime() - new Date(protocol.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const daysRemaining = protocol.endDate
    ? Math.floor(
        (new Date(protocol.endDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 30 - daysElapsed;

  // Mock timeline data (would come from API)
  const timelineData = Array.from({ length: Math.min(daysElapsed, 30) }, (_, i) => {
    const date = new Date(protocol.startDate);
    date.setDate(date.getDate() + i);
    return {
      date,
      value: 50 + Math.random() * 20, // Mock metric value
      adherence: Math.random() * 100,
      notes: i % 7 === 0 ? `Week ${Math.floor(i / 7) + 1} checkpoint` : undefined,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        variants={glassEntranceAnimation}
        initial="initial"
        animate="animate"
        className="mb-8"
      >
        <Link
          href="/protocols"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Protocols</span>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              {protocol.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Started {new Date(protocol.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {daysElapsed} days elapsed • {daysRemaining} days remaining
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                protocol.status === 'active'
                  ? 'bg-success/10 text-success'
                  : protocol.status === 'completed'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-warning/10 text-warning'
              }`}
            >
              {protocol.status}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <TimelineView
            experimentId={protocol.id}
            startDate={new Date(protocol.startDate)}
            endDate={protocol.endDate ? new Date(protocol.endDate) : undefined}
            dataPoints={timelineData}
            metricName="Primary Metric"
          />

          {/* Protocol Instructions */}
          <motion.div
            variants={glassEntranceAnimation}
            initial="initial"
            animate="animate"
            className="glass-card p-6 rounded-2xl"
          >
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Today's Instructions
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">1</span>
                </div>
                <p className="text-text-primary">
                  Morning meditation: 10 minutes at 6:00 AM
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">2</span>
                </div>
                <p className="text-text-primary">
                  Cold plunge: 2 minutes at 6:30 AM
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">3</span>
                </div>
                <p className="text-text-primary">
                  Evening breathwork: 5 minutes at 8:00 PM
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          <motion.div
            variants={glassEntranceAnimation}
            initial="initial"
            animate="animate"
            className="glass-card p-6 rounded-2xl"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-secondary">Adherence</span>
                  <span className="font-medium text-text-primary">
                    {protocol.adherence ? Math.round(protocol.adherence) : 0}%
                  </span>
                </div>
                <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-success-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${protocol.adherence || 0}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-secondary">Days Completed</span>
                  <span className="font-medium text-text-primary">
                    {daysElapsed} / 30
                  </span>
                </div>
                <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(daysElapsed / 30) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Correlations */}
          <motion.div
            variants={glassEntranceAnimation}
            initial="initial"
            animate="animate"
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Correlations
              </h3>
              <button
                onClick={handleCalculateCorrelations}
                disabled={calculating}
                className="text-xs text-primary hover:underline disabled:opacity-50"
              >
                {calculating ? 'Calculating...' : 'Recalculate'}
              </button>
            </div>
            {protocol.correlations && protocol.correlations.length > 0 ? (
              <div className="space-y-3">
                {protocol.correlations.map((corr) => (
                  <div
                    key={corr.metric}
                    className="flex items-center justify-between p-2 rounded-lg bg-bg-elevated"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary capitalize">
                        {corr.metric.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {corr.confidence} confidence
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          corr.improvement > 0 ? 'text-success' : 'text-error'
                        }`}
                      >
                        {corr.improvement > 0 ? '+' : ''}
                        {corr.improvement.toFixed(1)}%
                      </p>
                      <p className="text-xs text-text-secondary">
                        r={corr.correlation.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
                <p className="text-sm text-text-secondary mb-3">
                  No correlations calculated yet
                </p>
                <button
                  onClick={handleCalculateCorrelations}
                  disabled={calculating}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 text-sm"
                >
                  {calculating ? 'Calculating...' : 'Calculate Correlations'}
                </button>
              </div>
            )}
          </motion.div>

          {/* Correlated Metrics */}
          {protocol.correlatedMetrics &&
            Object.keys(protocol.correlatedMetrics).length > 0 && (
              <motion.div
                variants={glassEntranceAnimation}
                initial="initial"
                animate="animate"
                className="glass-card p-6 rounded-2xl"
              >
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Affected Metrics
                </h3>
                <div className="space-y-2">
                  {Object.entries(protocol.correlatedMetrics).map(
                    ([metric, change]: [string, any]) => (
                      <div
                        key={metric}
                        className="flex items-center justify-between p-2 rounded-lg bg-bg-elevated"
                      >
                        <span className="text-sm text-text-primary capitalize">
                          {metric.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            change > 0 ? 'text-success' : 'text-error'
                          }`}
                        >
                          {change > 0 ? '+' : ''}
                          {change}%
                        </span>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}
        </div>
      </div>
    </div>
  );
}
