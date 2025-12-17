'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from '@/hooks/useAccount';
import PageTransition from '@/components/ui/PageTransition';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { TestTube, BarChart3, TrendingUp, Filter, SlidersHorizontal, Plus, Download, Share2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const biomarkersData = [
  { name: 'Blood Glucose', value: 85, unit: 'mg/dL', trend: 'stable' },
  { name: 'Cholesterol (LDL)', value: 95, unit: 'mg/dL', trend: 'down' },
  { name: 'Vitamin D', value: 45, unit: 'ng/mL', trend: 'up' },
  { name: 'Cortisol', value: 15, unit: 'μg/dL', trend: 'stable' },
];

const trendConfig = {
  up: { icon: TrendingUp, color: 'text-emerald-300' },
  down: { icon: TrendingUp, color: 'text-rose-300' },
  stable: { icon: BarChart3, color: 'text-slate-400' },
};

// Pale chart colors
const CHART_COLORS = {
  blue: '#93c5fd',
  green: '#86efac',
  red: '#fca5a5',
  orange: '#fdba74',
  pink: '#f9a8d4',
  purple: '#d8b4fe',
};

export default function BiomarkersPage() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Mock loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <PageTransition>
      <div className="page-container">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="flex justify-between items-start page-header"
        >
          <div>
            <h1 className="page-title">Biomarker Tracking</h1>
            <p className="page-subtitle max-w-2xl">
              Monitor your key health metrics over time.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost p-2"><Filter className="w-5 h-5" /></button>
            <button className="btn-ghost p-2"><Download className="w-5 h-5" /></button>
            <button className="btn-ghost p-2"><Share2 className="w-5 h-5" /></button>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="btn-primary p-2"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {showForm && <BiomarkerForm close={() => setShowForm(false)} />}

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading biomarkers..." />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {biomarkersData.map((marker, i) => (
              <BiomarkerCard key={i} {...marker} />
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

function BiomarkerCard({ name, value, unit, trend }: any) {
  const { icon: Icon, color } = trendConfig[trend];
  const chartData = [
    { name: 'Jan', value: value * 0.9 },
    { name: 'Feb', value: value * 1.1 },
    { name: 'Mar', value: value * 0.95 },
    { name: 'Apr', value: value },
  ];

  return (
    <motion.div variants={fadeInUp} className="glass-card-hover p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-base font-semibold text-text-primary">{name}</p>
          <p className="text-3xl font-bold text-text-primary">{value} <span className="text-lg text-text-secondary">{unit}</span></p>
        </div>
        <div className={`flex items-center gap-1 ${color}`}>
          <Icon className="w-5 h-5" />
          <span className="text-sm font-medium capitalize">{trend}</span>
        </div>
      </div>
      <div className="h-32 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${name}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.35}/>
                <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e2e8f0',
                color: '#1e293b',
                backdropFilter: 'blur(4px)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              }}
            />
            <Area type="monotone" dataKey="value" stroke={CHART_COLORS.blue} strokeWidth={2} fill={`url(#gradient-${name})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function BiomarkerForm({ close }: { close: () => void }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="glass-card p-6 mb-8"
    >
      <h2 className="text-xl font-semibold mb-4">Log New Biomarker</h2>
      {/* Form fields would go here */}
      <div className="flex justify-end gap-4 mt-4">
        <button onClick={close} className="text-sm font-medium text-text-secondary">Cancel</button>
        <button className="btn-primary">Save</button>
      </div>
    </motion.div>
  );
}

