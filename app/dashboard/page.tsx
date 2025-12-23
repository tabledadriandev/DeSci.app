'use client';

import { Navbar } from '@/components/navbar/Navbar';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { BiomarkerTable } from '@/components/tables/BiomarkerTable';
import { BiomarkerModal } from '@/components/modal/BiomarkerModal';
import { StatCard } from '@/components/stats/StatCard';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Heart, TrendingUp, Shield, Brain, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [biomarkers, setBiomarkers] = useState<any[]>([]);

  useEffect(() => {
    // Load biomarkers data
    const loadBiomarkers = async () => {
      try {
        // In production, fetch from API
        const sampleData = [
          {
            name: 'Cystatin C',
            value: 0.95,
            unit: 'mg/L',
            normalRange: { min: 0.6, max: 1.2 },
            status: 'optimal',
            percentile: 75,
            explanation:
              'Cystatin C is a kidney function marker. Your value is optimal, indicating excellent kidney filtration.',
            actions: [
              'Maintain current sodium intake',
              'Continue regular exercise',
              'Stay hydrated',
            ],
            researchLinks: [
              {
                title: 'Cystatin C as a Biomarker of Kidney Decline',
                doi: '10.1053/j.ackd.2012.09.010',
                year: 2013,
              },
            ],
          },
          {
            name: 'Glucose',
            value: 92,
            unit: 'mg/dL',
            normalRange: { min: 70, max: 100 },
            status: 'normal',
            percentile: 50,
            explanation:
              'Fasting glucose level is within normal range. This indicates good metabolic health.',
            actions: [
              'Maintain balanced diet',
              'Continue regular exercise',
              'Monitor quarterly',
            ],
            researchLinks: [
              {
                title: 'Fasting Glucose and Metabolic Health',
                doi: '10.2337/dc14-2441',
                year: 2015,
              },
            ],
          },
        ];
        setBiomarkers(sampleData);
      } catch (error) {
        console.error('Error loading biomarkers:', error);
      }
    };

    loadBiomarkers();
  }, []);

  const ageData = [
    { month: 'Jan', biological: 48, chronological: 45 },
    { month: 'Feb', biological: 48, chronological: 45 },
    { month: 'Mar', biological: 47.5, chronological: 45 },
    { month: 'Apr', biological: 47.2, chronological: 45 },
    { month: 'May', biological: 47, chronological: 45 },
  ];

  return (
    <>
      <Navbar />

      <main className="p-4 md:p-8 bg-base-200 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-2">
            Your Health Dashboard
          </h1>
          <p className="text-base-content/60">Welcome back! Here's your longevity snapshot.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardCard
            title="Biological Age"
            value="47.0"
            subtitle="years"
            icon={<Heart className="w-6 h-6" />}
            status="success"
            trend={{ direction: 'down', percentage: 1.8 }}
          />
          <DashboardCard
            title="Health Score"
            value="847"
            subtitle="/ 850"
            icon={<TrendingUp className="w-6 h-6" />}
            status="success"
            trend={{ direction: 'up', percentage: 3.2 }}
          />
          <DashboardCard
            title="Credentials"
            value="3"
            subtitle="Verified"
            icon={<Shield className="w-6 h-6" />}
            status="info"
          />
          <DashboardCard
            title="Percentile"
            value="87th"
            subtitle="Among peers"
            icon={<Brain className="w-6 h-6" />}
            status="success"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Biological Age Trend */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title text-base-content">Biological Age Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="biological"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    name="Biological Age"
                  />
                  <Line
                    type="monotone"
                    dataKey="chronological"
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    name="Chronological Age"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <StatCard
              title="Recent Tests"
              value="5"
              description="In the last 6 months"
              icon={<Heart className="w-8 h-8" />}
              variant="primary"
            />
            <StatCard
              title="Research Papers"
              value="12"
              description="You've contributed to"
              icon={<Brain className="w-8 h-8" />}
              variant="success"
            />
            <StatCard
              title="Community Rank"
              value="#1,247"
              description="Global health leaderboard"
              icon={<Users className="w-8 h-8" />}
              variant="secondary"
            />
          </div>
        </div>

        {/* Biomarker Results */}
        <div className="card bg-base-100 shadow-md mb-8">
          <div className="card-body">
            <h2 className="card-title text-base-content mb-4">Latest Biomarker Results</h2>
            <BiomarkerTable data={biomarkers} />
          </div>
        </div>

        {/* Modals for biomarkers */}
        {biomarkers.map((biomarker, idx) => (
          <BiomarkerModal
            key={idx}
            modalId={`biomarker_modal_${idx}`}
            biomarkerName={biomarker.name}
            value={biomarker.value}
            unit={biomarker.unit}
            explanation={biomarker.explanation}
            actions={biomarker.actions}
            researchLinks={biomarker.researchLinks}
          />
        ))}

        {/* Call to Action */}
        <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30">
          <div className="card-body">
            <h2 className="card-title text-base-content">Ready for your next assessment?</h2>
            <p className="text-base-content/70">
              Update your biomarkers to track your biological age progress.
            </p>
            <div className="card-actions">
              <button className="btn btn-primary">Start New Assessment</button>
              <button className="btn btn-outline">View Results</button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

