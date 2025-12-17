'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Info, Database, Wallet, BarChart3 } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp } from '@/lib/animations/variants';
import { useToast } from '@/components/ui/ToastProvider';

export default function DataLicensingSettingsPage() {
  const { address } = useAccount();
  const [optedIn, setOptedIn] = useState(false);
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (address) {
      // Mock data loading
      setTimeout(() => {
        setOptedIn(true);
        setDataTypes(['all']);
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [address]);

  const handleToggle = async (newOptedIn: boolean) => {
    if (!address) {
      showToast({ type: 'error', title: 'Please connect your wallet' });
      return;
    }

    setSaving(true);
    // Mock API call
    setTimeout(() => {
      setOptedIn(newOptedIn);
      showToast({ type: 'success', title: 'Settings Updated', description: `You have ${newOptedIn ? 'opted in to' : 'opted out of'} data sharing.` });
      setSaving(false);
    }, 1000);
  };
  
  const handleDataTypeChange = (newType: string) => {
    setDataTypes([newType]);
    // Mock API call
    showToast({ type: 'success', title: 'Data Preference Updated', description: `Sharing preference set to ${newType}.` });
  };

  const dataTypeOptions = [
    { id: 'all', label: 'All Data Types', description: 'Biomarkers, meal logs, microbiome, health assessments' },
    { id: 'biomarkers', label: 'Biomarkers Only', description: 'Lab results and health metrics' },
    { id: 'meal_logs', label: 'Meal Logs Only', description: 'Nutrition and meal tracking data' },
    { id: 'microbiome', label: 'Microbiome Only', description: 'Gut health and microbiome analysis' },
  ];

  return (
    <PageTransition>
      <div className="page-container max-w-4xl">
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="page-header">
          <h1 className="page-title">Data Licensing & Research</h1>
          <p className="page-subtitle">
            Control how your anonymized health data is used for research and earn dividends.
          </p>
        </motion.div>

        {!address ? (
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card text-center py-12 mt-8 max-w-md mx-auto">
            <Wallet className="w-16 h-16 text-accent-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">Connect Your Wallet</h2>
            <p className="text-text-secondary">Please connect your wallet to manage your data sharing preferences.</p>
          </motion.div>
        ) : loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading your data preferences..." />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto mt-8 space-y-8">
            <motion.div variants={fadeInUp} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-accent-primary" /> Data Sharing Opt-In
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Your anonymized health data can be licensed for research, earning you 40% of all licensing revenue.
                  </p>
                </div>
                <AnimatedButton
                  onClick={() => handleToggle(!optedIn)}
                  disabled={saving}
                  variant={optedIn ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {saving ? 'Saving...' : optedIn ? 'Opted In' : 'Opt Out'}
                </AnimatedButton>
              </div>

              <AnimatePresence>
                {optedIn && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="glass-card p-4 flex items-start gap-2"
                  >
                    <Info className="w-5 h-5 text-accent-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-text-secondary">
                      <strong>Your data is always anonymized:</strong> All personally identifiable information (wallet addresses, emails, names) is removed before aggregation. Only statistical patterns and trends are shared.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {optedIn && (
                <motion.div variants={fadeInUp} className="glass-card p-6">
                  <h3 className="text-xl font-bold text-text-primary mb-4">Data Types to Share</h3>
                  <div className="space-y-3">
                    {dataTypeOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`glass-card-hover p-4 flex items-center gap-4 cursor-pointer transition-all ${
                          (dataTypes.includes('all') || dataTypes.includes(option.id)) ? 'ring-2 ring-accent-primary' : ''
                        }`}
                        onClick={() => handleDataTypeChange(option.id)}
                      >
                        <input
                          type="radio"
                          name="dataType"
                          value={option.id}
                          checked={dataTypes.includes('all') || dataTypes.includes(option.id)}
                          onChange={() => handleDataTypeChange(option.id)}
                          className="w-5 h-5 text-accent-primary bg-bg-surface border-border-medium focus:ring-accent-primary"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-text-primary">{option.label}</p>
                          <p className="text-xs text-text-secondary mt-1">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div className="glass-card p-6" variants={fadeInUp}>
              <h3 className="text-xl font-bold text-text-primary mb-4">How It Works</h3>
              <div className="space-y-4 text-sm text-text-secondary">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-bio-gradient text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <strong className="text-text-primary">Opt In:</strong> Choose to share your anonymized data for research purposes.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-bio-gradient text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <strong className="text-text-primary">Anonymization:</strong> All personal identifiers are removed. Only aggregate statistics are shared.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-bio-gradient text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <strong className="text-text-primary">Licensing & Dividends:</strong> You receive 40% of licensing revenue as $TA tokens, distributed quarterly.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

