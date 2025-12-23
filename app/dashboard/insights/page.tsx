/**
 * AI Insights Dashboard
 * Personalized health recommendations
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import InsightCard from '@/components/biometrics/InsightCard';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

interface Insight {
  id: string;
  type: 'sleep' | 'recovery' | 'nutrition' | 'exercise' | 'stress' | 'general';
  headline: string;
  emoji: string;
  explanation: string;
  recommendation: string;
  confidence: number;
  learnMoreUrl?: string;
  relatedMetrics?: string[];
  createdAt: string;
}

export default function InsightsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const res = await fetch('/api/ai/insights/generate');
      if (!res.ok) throw new Error('Failed to fetch insights');
      const json = await res.json();
      return json.insights as Insight[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai/insights/generate', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to generate insights');
      const json = await res.json();
      return json.insights as Insight[];
    },
    onSuccess: (insights) => {
      queryClient.setQueryData(['ai-insights'], insights);
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-text-secondary">Generating insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-error mb-4">Error loading insights</p>
          <button
            onClick={() => generateMutation.mutate()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const insights = data || [];

  // Group insights by type
  const insightsByType: Record<string, Insight[]> = {};
  insights.forEach((insight) => {
    if (!insightsByType[insight.type]) {
      insightsByType[insight.type] = [];
    }
    insightsByType[insight.type].push(insight);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        variants={glassEntranceAnimation}
        initial="initial"
        animate="animate"
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-text-primary">
                AI Insights
              </h1>
            </div>
            <p className="text-text-secondary">
              Personalized recommendations based on your data
            </p>
          </div>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Insights by Type */}
      {Object.keys(insightsByType).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(insightsByType).map(([type, typeInsights]) => (
            <motion.section
              key={type}
              variants={glassEntranceAnimation}
              initial="initial"
              animate="animate"
            >
              <h2 className="text-xl font-semibold text-text-primary mb-4 capitalize">
                {type} Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {typeInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    headline={insight.headline}
                    explanation={insight.explanation}
                    action={insight.recommendation}
                    confidence={insight.confidence}
                    learnMoreLink={insight.learnMoreUrl}
                    type={
                      insight.type === 'sleep' || insight.type === 'recovery'
                        ? 'info'
                        : insight.type === 'nutrition' || insight.type === 'exercise'
                        ? 'success'
                        : insight.type === 'stress'
                        ? 'warning'
                        : 'info'
                    }
                  />
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      ) : (
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="glass-card p-12 rounded-2xl text-center"
        >
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No Insights Yet
          </h3>
          <p className="text-text-secondary mb-6">
            Start syncing your wearables and logging meals to get personalized
            AI insights
          </p>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Insights'
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
