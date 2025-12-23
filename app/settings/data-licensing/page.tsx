'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Shield, CheckCircle, XCircle, Info } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

export default function DataLicensingSettingsPage() {
  const { address } = useAccount();
  const [optedIn, setOptedIn] = useState(false);
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (address) {
      loadOptInStatus();
    }
  }, [address]);

  const loadOptInStatus = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/data-licensing/opt-in?address=${address}`);
      const data = await response.json();

      if (response.ok) {
        setOptedIn(data.optedIn);
        setDataTypes(data.dataTypes || []);
      }
    } catch (error) {
      console.error('Error loading opt-in status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (newOptedIn: boolean) => {
    if (!address) {
      setMessage({ type: 'error', text: 'Please connect your wallet' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/data-licensing/opt-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          optedIn: newOptedIn,
          dataTypes: dataTypes.length > 0 ? dataTypes : ['all'],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOptedIn(data.data.optedIn);
        setDataTypes(data.data.dataTypes);
        setMessage({
          type: 'success',
          text: newOptedIn
            ? 'You have opted in to data sharing. Thank you for contributing to research!'
            : 'You have opted out of data sharing.',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update preference' });
      }
    } catch (error) {
      console.error('Error updating opt-in:', error);
      setMessage({ type: 'error', text: 'Failed to update preference' });
    } finally {
      setSaving(false);
    }
  };

  const dataTypeOptions = [
    { id: 'all', label: 'All Data Types', description: 'Biomarkers, meal logs, microbiome, health assessments' },
    { id: 'biomarkers', label: 'Biomarkers Only', description: 'Lab results and health metrics' },
    { id: 'meal_logs', label: 'Meal Logs Only', description: 'Nutrition and meal tracking data' },
    { id: 'microbiome', label: 'Microbiome Only', description: 'Gut health and microbiome analysis' },
    { id: 'health_assessments', label: 'Health Assessments Only', description: 'Questionnaire and assessment data' },
  ];

  return (
    <div className="min-h-screen  p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-display text-accent-primary mb-2">
            Data Licensing & Research
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            Control how your anonymized health data is used for research and earn dividends from
            data licensing revenue.
          </p>
        </div>

        {!address && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
            <h2 className="text-2xl font-display text-text-primary mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Please connect your wallet to manage your data sharing preferences.
            </p>
          </div>
        )}

        {address && (
          <>

        {message && address && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-display text-text-primary mb-2">
                Data Sharing Opt-In
              </h2>
              <p className="text-sm text-text-secondary">
                When you opt in, your anonymized health data (with all personally identifiable
                information removed) can be licensed to research institutions, pharmaceutical
                companies, and longevity clinics. You earn 40% of all licensing revenue as
                dividends.
              </p>
            </div>
            {loading ? (
              <Skeleton className="w-28 h-9 rounded-lg" />
            ) : (
              <button
                type="button"
                onClick={() => handleToggle(!optedIn)}
                disabled={saving}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  optedIn
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {saving ? 'Saving...' : optedIn ? 'Opted In' : 'Opt Out'}
              </button>
            )}
          </div>

          {optedIn && !loading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  <strong>Your data is anonymized:</strong> All personally identifiable information
                  (wallet addresses, emails, names) is removed before aggregation. Only statistical
                  patterns and trends are shared.
                </p>
              </div>
            </div>
          )}
        </div>

        {optedIn && !loading && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-display text-text-primary mb-4">
              Data Types to Share
            </h3>
            <div className="space-y-3">
              {dataTypeOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-start gap-3 p-3 border border-border-light rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="dataType"
                    value={option.id}
                    checked={dataTypes.includes(option.id) || (dataTypes.length === 0 && option.id === 'all')}
                    onChange={() => {
                      const newTypes = option.id === 'all' ? ['all'] : [option.id];
                      setDataTypes(newTypes);
                      handleToggle(true);
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-text-primary text-sm">{option.label}</div>
                    <div className="text-xs text-text-secondary mt-1">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h3 className="text-lg font-display text-text-primary mb-4">How It Works</h3>
          <div className="space-y-4 text-sm text-text-secondary">
            <div>
              <strong className="text-text-primary">1. Opt In:</strong> Choose to share your
              anonymized data for research purposes.
            </div>
            <div>
              <strong className="text-text-primary">2. Anonymization:</strong> All personal
              identifiers are removed. Only aggregate statistics are shared.
            </div>
            <div>
              <strong className="text-text-primary">3. Licensing:</strong> Research institutions
              purchase access to anonymized datasets.
            </div>
            <div>
              <strong className="text-text-primary">4. Dividends:</strong> You receive 40% of
              licensing revenue as $tabledadrian tokens or platform credits, distributed quarterly.
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

