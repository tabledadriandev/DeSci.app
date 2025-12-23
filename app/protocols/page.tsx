/**
 * Protocols Dashboard
 * List all user's biohacking protocols
 */

'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';
import ProtocolCard from '@/components/biometrics/ProtocolCard';
import { glassEntranceAnimation } from '@/lib/animations/glassEntrance';

interface Protocol {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  status: string;
  adherence: number | null;
  correlatedMetrics: any;
}

export default function ProtocolsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['protocols'],
    queryFn: async () => {
      const res = await fetch('/api/protocols/list?status=all');
      if (!res.ok) throw new Error('Failed to fetch protocols');
      const json = await res.json();
      return json.protocols as Protocol[];
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-text-secondary">Loading protocols...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-error">Error loading protocols</p>
        </div>
      </div>
    );
  }

  const protocols = data || [];
  const activeProtocols = protocols.filter(p => p.status === 'active');
  const completedProtocols = protocols.filter(p => p.status === 'completed');

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
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Biohacking Protocols
            </h1>
            <p className="text-text-secondary">
              Track 30-day experiments and measure correlations
            </p>
          </div>
          <Link
            href="/protocols/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Protocol</span>
          </Link>
        </div>
      </motion.div>

      {/* Active Protocols */}
      {activeProtocols.length > 0 && (
        <motion.section
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Active Protocols
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProtocols.map((protocol) => (
              <Link key={protocol.id} href={`/protocols/${protocol.id}`}>
                <ProtocolCard
                  name={protocol.name}
                  streak={Math.floor(
                    (new Date().getTime() - new Date(protocol.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                  lastCompleted={new Date(protocol.startDate)}
                  correlatedMetrics={protocol.correlatedMetrics || {}}
                  adherence={protocol.adherence || 0}
                  onEdit={() => {}}
                  onLog={() => {}}
                />
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* Completed Protocols */}
      {completedProtocols.length > 0 && (
        <motion.section
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Completed Protocols
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedProtocols.map((protocol) => (
              <Link key={protocol.id} href={`/protocols/${protocol.id}`}>
                <ProtocolCard
                  name={protocol.name}
                  streak={protocol.endDate
                    ? Math.floor(
                        (new Date(protocol.endDate).getTime() -
                          new Date(protocol.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0}
                  lastCompleted={protocol.endDate ? new Date(protocol.endDate) : undefined}
                  correlatedMetrics={protocol.correlatedMetrics || {}}
                  adherence={protocol.adherence || 0}
                  onEdit={() => {}}
                  onLog={() => {}}
                />
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* Empty State */}
      {protocols.length === 0 && (
        <motion.div
          variants={glassEntranceAnimation}
          initial="initial"
          animate="animate"
          className="glass-card p-12 rounded-2xl text-center"
        >
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            No Protocols Yet
          </h3>
          <p className="text-text-secondary mb-6">
            Create your first 30-day biohacking experiment to track correlations
            with your biomarkers
          </p>
          <Link
            href="/protocols/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Protocol</span>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
