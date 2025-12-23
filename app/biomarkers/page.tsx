'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, HTMLMotionProps } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Plus, 
  Download,
  Share2,
  Brain,
  FileText,
  TestTube,
  Activity,
  AlertCircle,
  CheckCircle,
  BarChart3,
  LineChart as LineChartIcon,
  Target,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

interface BiomarkerData {
  // Vital Signs
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  breathingRate?: number;
  
  // Body Composition
  weight?: number;
  bmi?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  
  // Blood Work
  bloodGlucose?: number;
  cholesterolTotal?: number;
  cholesterolLDL?: number;
  cholesterolHDL?: number;
  triglycerides?: number;
  
  // Vitamins
  vitaminD?: number;
  vitaminB12?: number;
  iron?: number;
  ferritin?: number;
  
  // Hormones
  testosterone?: number;
  cortisol?: number;
  tsh?: number;
  t3?: number;
  t4?: number;
  
  // Custom
  customValues?: Array<{ name: string; value: number; unit: string }>;
  
  labDate?: string;
  notes?: string;
}

const REFERENCE_RANGES: Record<string, { min: number; max: number; unit: string }> = {
  bloodPressureSystolic: { min: 90, max: 120, unit: 'mmHg' },
  bloodPressureDiastolic: { min: 60, max: 80, unit: 'mmHg' },
  heartRate: { min: 60, max: 100, unit: 'bpm' },
  temperature: { min: 36.1, max: 37.2, unit: '°C' },
  breathingRate: { min: 12, max: 20, unit: 'breaths/min' },
  bmi: { min: 18.5, max: 24.9, unit: '' },
  bodyFatPercentage: { min: 10, max: 20, unit: '%' },
  bloodGlucose: { min: 70, max: 100, unit: 'mg/dL' },
  cholesterolTotal: { min: 0, max: 200, unit: 'mg/dL' },
  cholesterolLDL: { min: 0, max: 100, unit: 'mg/dL' },
  cholesterolHDL: { min: 40, max: 200, unit: 'mg/dL' },
  triglycerides: { min: 0, max: 150, unit: 'mg/dL' },
  vitaminD: { min: 30, max: 100, unit: 'ng/mL' },
  vitaminB12: { min: 200, max: 900, unit: 'pg/mL' },
  iron: { min: 60, max: 170, unit: 'μg/dL' },
  ferritin: { min: 15, max: 200, unit: 'ng/mL' },
  testosterone: { min: 300, max: 1000, unit: 'ng/dL' },
  cortisol: { min: 10, max: 20, unit: 'μg/dL' },
  tsh: { min: 0.4, max: 4.0, unit: 'mIU/L' },
};

function getStatus(value: number, key: string): 'optimal' | 'borderline' | 'concerning' {
  const range = REFERENCE_RANGES[key];
  if (!range) return 'optimal';
  
  const { min, max } = range;
  const rangeSize = max - min;
  const optimalMin = min + rangeSize * 0.1;
  const optimalMax = max - rangeSize * 0.1;
  
  if (value >= optimalMin && value <= optimalMax) return 'optimal';
  if (value >= min && value <= max) return 'borderline';
  return 'concerning';
}

export default function BiomarkersPage() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState('vital');
  const [formData, setFormData] = useState<BiomarkerData>({});
  const [biomarkers, setBiomarkers] = useState<any[]>([]);
  const [unifiedResults, setUnifiedResults] = useState<any>(null);
  const [trends, setTrends] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedBiomarker, setSelectedBiomarker] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'unified' | 'traditional'>('unified');
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  // Load session user (email or wallet) so lab results work even without a connected wallet
  useEffect(() => {
    fetch('/api/auth/session')
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        const user = data?.user;
        if (user) {
          setSessionUserId(user.email || user.walletAddress || user.id || null);
        }
      })
      .catch(() => {
        setSessionUserId(null);
      });
  }, []);

  useEffect(() => {
    const userKey = address || sessionUserId;
    if (userKey) {
      loadBiomarkers(userKey);
      loadUnifiedResults(userKey);
    }
  }, [address, sessionUserId]);

  const loadBiomarkers = async (userKey: string) => {
    try {
      const response = await fetch(`/api/health/biomarkers?userId=${encodeURIComponent(userKey)}`);
      if (!response.ok) {
        // API route may not be wired yet in some environments – fail softly
        console.warn('Biomarkers API not available, skipping history load.');
        return;
      }
      const data = await response.json();
      setBiomarkers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading biomarkers:', error);
    }
  };

  const loadUnifiedResults = async (userKey: string) => {
    try {
      const response = await fetch(`/api/health/lab-results-unified?userId=${encodeURIComponent(userKey)}`);
      if (!response.ok) {
        console.warn('Unified lab-results API not available, skipping unified view.');
        return;
      }
      const data = await response.json();
      
      if (data && data.success) {
        setUnifiedResults(data);
        setTrends(data.trends || {});
      }
    } catch (error) {
      console.error('Error loading unified results:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userKey = address || sessionUserId;
    if (!userKey) {
      alert('Please login or connect your wallet before saving biomarkers.');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/health/biomarkers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userKey,
          ...formData,
          labDate: formData.labDate ? new Date(formData.labDate).toISOString() : undefined,
        }),
      });

      if (response.ok) {
        await loadBiomarkers(userKey);
        await loadUnifiedResults(userKey);
        setFormData({});
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error saving biomarker:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!address || !unifiedResults) return;

    try {
      // Get test result IDs
      const testResultIds = unifiedResults.results
        .filter((r: any) => r.testResultId)
        .map((r: any) => r.testResultId)
        .filter((id: string | undefined, index: number, self: string[]) => id && self.indexOf(id) === index);

      const params = new URLSearchParams({
        userId: address,
        includeTrends: 'true',
        includeRecommendations: 'true',
        includeReferenceRanges: 'true',
      });

      if (testResultIds.length > 0) {
        params.append('testResultIds', testResultIds.join(','));
      }

      // Open PDF in new tab
      window.open(`/api/health/reports/lab-results?${params.toString()}`, '_blank');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  const handleShare = async () => {
    if (!address || !shareEmail) {
      alert('Please enter a provider email address');
      return;
    }

    try {
      const response = await fetch('/api/health/reports/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          providerEmail: shareEmail,
          message: shareMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Lab results shared successfully!');
        setShowShareModal(false);
        setShareEmail('');
        setShareMessage('');
      } else {
        alert(data.error || 'Failed to share results');
      }
    } catch (error) {
      console.error('Error sharing results:', error);
      alert('Failed to share results. Please try again.');
    }
  };

  const tabs = [
    { id: 'vital', label: 'Vital Signs', icon: '❤️' },
    { id: 'body', label: 'Body Composition', icon: '⚖️' },
    { id: 'blood', label: 'Blood Work', icon: '🩸' },
    { id: 'vitamins', label: 'Vitamins', icon: '💊' },
    { id: 'hormones', label: 'Hormones', icon: '🧬' },
  ];

  return (
    <div className="min-h-screen  flex flex-col">
      {/* Shared top nav (desktop + mobile) */}
      <header className="w-full border-b border-border-light bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="px-3 py-1 text-xs sm:text-sm border border-border-light rounded-full hover:bg-cream whitespace-nowrap"
            >
              Dashboard
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <img src="/logo.ico" alt="Logo" className="w-6 h-6 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base">
                Table d'Adrian Wellness
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 sm:px-6 md:px-8 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-sans font-bold text-accent-primary whitespace-nowrap">
            Lab Results & Biomarkers
            </h1>
          <div className="flex items-center gap-2 md:gap-3 self-start md:self-auto">
            {/* Hide view toggle on phones to simplify UI */}
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'unified' ? 'traditional' : 'unified')}
                className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
              >
                <TestTube className="w-4 h-4" />
                {viewMode === 'unified' ? 'Traditional View' : 'Unified View'}
              </button>
              {unifiedResults && unifiedResults.results.length > 0 && (
                <>
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </>
              )}
          </div>
            {/* Log button: full label on desktop, icon-only FAB on phones */}
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 md:px-6 md:py-3 bg-accent-primary text-white rounded-full hover:bg-accent-primary/90 flex items-center justify-center gap-2 text-sm md:text-base fixed bottom-20 right-6 sm:static sm:bottom-auto sm:right-auto shadow-lg sm:shadow-none"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Log Biomarker</span>
            </button>
          </div>
      </div>
      </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-accent-primary text-white'
                  : 'bg-white text-text-primary hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-display mb-4">Log New Biomarker</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'vital' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Systolic BP</label>
                      <input
                        type="number"
                        value={formData.bloodPressureSystolic || ''}
                        onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Diastolic BP</label>
                      <input
                        type="number"
                        value={formData.bloodPressureDiastolic || ''}
                        onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={formData.heartRate || ''}
                      onChange={(e) => setFormData({ ...formData, heartRate: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.temperature || ''}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTab === 'body' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">BMI</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bmi || ''}
                      onChange={(e) => setFormData({ ...formData, bmi: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Body Fat %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bodyFatPercentage || ''}
                      onChange={(e) => setFormData({ ...formData, bodyFatPercentage: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {activeTab === 'blood' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Blood Glucose (mg/dL)</label>
                    <input
                      type="number"
                      value={formData.bloodGlucose || ''}
                      onChange={(e) => setFormData({ ...formData, bloodGlucose: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Total Cholesterol</label>
                      <input
                        type="number"
                        value={formData.cholesterolTotal || ''}
                        onChange={(e) => setFormData({ ...formData, cholesterolTotal: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">LDL</label>
                      <input
                        type="number"
                        value={formData.cholesterolLDL || ''}
                        onChange={(e) => setFormData({ ...formData, cholesterolLDL: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">HDL</label>
                      <input
                        type="number"
                        value={formData.cholesterolHDL || ''}
                        onChange={(e) => setFormData({ ...formData, cholesterolHDL: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Triglycerides</label>
                      <input
                        type="number"
                        value={formData.triglycerides || ''}
                        onChange={(e) => setFormData({ ...formData, triglycerides: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'vitamins' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Vitamin D (ng/mL)</label>
                      <input
                        type="number"
                        value={formData.vitaminD || ''}
                        onChange={(e) => setFormData({ ...formData, vitaminD: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Vitamin B12 (pg/mL)</label>
                      <input
                        type="number"
                        value={formData.vitaminB12 || ''}
                        onChange={(e) => setFormData({ ...formData, vitaminB12: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Iron (μg/dL)</label>
                      <input
                        type="number"
                        value={formData.iron || ''}
                        onChange={(e) => setFormData({ ...formData, iron: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Ferritin (ng/mL)</label>
                      <input
                        type="number"
                        value={formData.ferritin || ''}
                        onChange={(e) => setFormData({ ...formData, ferritin: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'hormones' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Testosterone (ng/dL)</label>
                      <input
                        type="number"
                        value={formData.testosterone || ''}
                        onChange={(e) => setFormData({ ...formData, testosterone: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cortisol (μg/dL)</label>
                      <input
                        type="number"
                        value={formData.cortisol || ''}
                        onChange={(e) => setFormData({ ...formData, cortisol: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">TSH (mIU/L)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.tsh || ''}
                        onChange={(e) => setFormData({ ...formData, tsh: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">T3</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.t3 || ''}
                        onChange={(e) => setFormData({ ...formData, t3: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">T4</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.t4 || ''}
                        onChange={(e) => setFormData({ ...formData, t4: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Lab Date</label>
                <input
                  type="date"
                  value={formData.labDate || ''}
                  onChange={(e) => setFormData({ ...formData, labDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
          </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Biomarker'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({});
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Unified View - Enhanced Dashboard */}
        {viewMode === 'unified' && unifiedResults && (
          <div className="space-y-6 mb-6">
            {/* Summary Card */}
            {unifiedResults.summary && (
              <div className="bg-white rounded-xl shadow-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {unifiedResults.summary.totalResults || 0}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">Total Results</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {unifiedResults.summary.totalTestResults || 0}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">Test Kits</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {unifiedResults.summary.totalBiomarkerEntries || 0}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">Biomarkers</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm font-bold text-orange-600">
                      {unifiedResults.summary.dateRange?.earliest 
                        ? new Date(unifiedResults.summary.dateRange.earliest).toLocaleDateString()
                        : 'N/A'}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">Earliest Test</div>
                  </div>
                </div>
      </div>
            )}

            {/* Biomarkers with Trends */}
            {Object.keys(trends).length > 0 && (
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h2 className="text-2xl font-display mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Biomarker Trends & Analysis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(trends).map(([biomarkerName, trendData]: [string, any]) => {
                    if (trendData.trend === 'insufficient_data') return null;

                    const status = trendData.latestValue
                      ? getStatus(trendData.latestValue, biomarkerName)
                      : 'optimal';
                    
                    const trendIcon = trendData.trend === 'improving' ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : trendData.trend === 'declining' ? (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    ) : (
                      <Minus className="w-5 h-5 text-gray-500" />
                    );

  return (
                      <div
                        key={biomarkerName}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-text-primary">
                            {biomarkerName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h3>
                          <div className="flex items-center gap-2">
                            {trendIcon}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              status === 'optimal' ? 'bg-green-100 text-green-700' :
                              status === 'borderline' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {status}
                            </span>
        </div>
      </div>
                        <div className="text-2xl font-bold text-accent-primary mb-1">
                          {trendData.latestValue?.toFixed(1) || 'N/A'}
                          <span className="text-sm text-text-secondary ml-1">
                            {REFERENCE_RANGES[biomarkerName]?.unit || ''}
                          </span>
                        </div>
                        {trendData.change !== undefined && trendData.change !== 0 && (
                          <div className={`text-sm ${
                            trendData.trend === 'improving' ? 'text-green-600' :
                            trendData.trend === 'declining' ? 'text-red-600' :
                            'text-gray-500'
                          }`}>
                            {trendData.change > 0 ? '+' : ''}{trendData.change.toFixed(1)}% change
                          </div>
                        )}
                        {trendData.dataPoints && trendData.dataPoints.length > 1 && (
                          <button
                            onClick={() => setSelectedBiomarker(selectedBiomarker === biomarkerName ? null : biomarkerName)}
                            className="text-xs text-accent-primary mt-2 hover:underline flex items-center gap-1"
                          >
                            <LineChartIcon className="w-3 h-3" />
                            {selectedBiomarker === biomarkerName ? 'Hide' : 'Show'} trend chart
                          </button>
                        )}
                        {selectedBiomarker === biomarkerName && trendData.dataPoints && trendData.dataPoints.length > 1 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={trendData.dataPoints.map((dp: any) => ({
                                  date: new Date(dp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                  value: dp.value,
                                  min: REFERENCE_RANGES[biomarkerName]?.min || 0,
                                  max: REFERENCE_RANGES[biomarkerName]?.max || 100,
                                  optimalMin: REFERENCE_RANGES[biomarkerName] 
                                    ? REFERENCE_RANGES[biomarkerName].min + (REFERENCE_RANGES[biomarkerName].max - REFERENCE_RANGES[biomarkerName].min) * 0.1
                                    : 0,
                                  optimalMax: REFERENCE_RANGES[biomarkerName]
                                    ? REFERENCE_RANGES[biomarkerName].max - (REFERENCE_RANGES[biomarkerName].max - REFERENCE_RANGES[biomarkerName].min) * 0.1
                                    : 100,
                                }))}
                              >
            <defs>
                                  <linearGradient id={`gradient-${biomarkerName}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
              </linearGradient>
            </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DC" />
                                <XAxis
                                  dataKey="date"
                                  stroke="#6B6560"
                                  fontSize={12}
                                  tickLine={false}
                                />
                                <YAxis
                                  stroke="#6B6560"
                                  fontSize={12}
                                  tickLine={false}
                                />
            <Tooltip
              contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E8E3DC',
                borderRadius: '8px',
                                    padding: '8px 12px',
                                  }}
                                />
                                <ReferenceLine
                                  y={trendData.dataPoints[0]?.optimalMin}
                                  stroke="#10B981"
                                  strokeDasharray="5 5"
                                  label={{ value: 'Optimal Min', position: 'right' }}
                                />
                                <ReferenceLine
                                  y={trendData.dataPoints[0]?.optimalMax}
                                  stroke="#10B981"
                                  strokeDasharray="5 5"
                                  label={{ value: 'Optimal Max', position: 'right' }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#0F4C81"
                                  strokeWidth={2}
                                  fill="url(#gradient-${biomarkerName})"
                                />
          </AreaChart>
        </ResponsiveContainer>
      </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {/* Test Results Section */}
            {unifiedResults.results && unifiedResults.results.length > 0 && (
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h2 className="text-2xl font-display mb-6 flex items-center gap-2">
                  <TestTube className="w-6 h-6" />
                  All Test Results
                </h2>
                <div className="space-y-4">
                  {unifiedResults.results.map((result: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-text-primary">
                              {result.testName || result.source || 'Biomarker Entry'}
                            </h3>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {result.source === 'test_result' ? 'Test Kit' : 'Manual Entry'}
                            </span>
                            {result.provider && (
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {result.provider}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-text-secondary mb-2">
                            {new Date(result.date).toLocaleDateString()}
                          </div>
                          {result.statusMap && Object.keys(result.statusMap).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(result.statusMap).slice(0, 5).map(([field, status]: [string, any]) => (
                                <span
                                  key={field}
                                  className={`text-xs px-2 py-1 rounded ${
                                    status === 'optimal' ? 'bg-green-100 text-green-700' :
                                    status === 'borderline' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {field.replace(/([A-Z])/g, ' $1')}: {status}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Traditional Biomarker Display */}
        {viewMode === 'traditional' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-display mb-6">Biomarker History</h2>
            {biomarkers.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                No biomarkers logged yet. Start tracking to see trends!
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(REFERENCE_RANGES).map((key) => {
                  const values = biomarkers
                    .map(b => ({ value: b[key], date: b.recordedAt }))
                    .filter(v => v.value != null)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                  if (values.length === 0) return null;

                  const latest = values[values.length - 1];
                  const previous = values.length > 1 ? values[values.length - 2] : null;
                  const trend = previous ? (latest.value > previous.value ? 'up' : latest.value < previous.value ? 'down' : 'stable') : 'stable';
                  const status = getStatus(latest.value, key);

  return (
                  <div key={key} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl font-bold text-accent-primary">
                            {latest.value} {REFERENCE_RANGES[key]?.unit}
                          </span>
                          {previous && (
                            <span className={`flex items-center gap-1 ${
                              trend === 'up' ? 'text-green-600' :
                              trend === 'down' ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {trend === 'up' && <TrendingUp className="w-4 h-4" />}
                              {trend === 'down' && <TrendingDown className="w-4 h-4" />}
                              {trend === 'stable' && <Minus className="w-4 h-4" />}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        status === 'optimal' ? 'bg-green-100 text-green-700' :
                        status === 'borderline' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary">
                      Reference: {REFERENCE_RANGES[key]?.min}-{REFERENCE_RANGES[key]?.max} {REFERENCE_RANGES[key]?.unit}
                    </div>
                    <div className="mt-2 text-xs text-text-secondary">
                      Last updated: {new Date(latest.date).toLocaleDateString()}
                    </div>
                    {values.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedBiomarker(selectedBiomarker === key ? null : key)}
                          className="text-xs text-accent-primary mt-2 hover:underline flex items-center gap-1"
                        >
                          <LineChartIcon className="w-3 h-3" />
                          {selectedBiomarker === key ? 'Hide' : 'Show'} trend chart
                        </button>
                        {selectedBiomarker === key && (
                          <div className="mt-4 h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={values.map((v) => ({
                                  date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                  value: v.value,
                                }))}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DC" />
                                <XAxis
                                  dataKey="date"
                                  stroke="#6B6560"
                                  fontSize={10}
                                  tickLine={false}
                                />
                                <YAxis
                                  stroke="#6B6560"
                                  fontSize={10}
                                  tickLine={false}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E8E3DC',
                                    borderRadius: '8px',
                                    padding: '6px 10px',
                                  }}
                                />
                                <ReferenceLine
                                  y={REFERENCE_RANGES[key]?.min}
                                  stroke="#F59E0B"
                                  strokeDasharray="3 3"
                                  label={{ value: 'Min', position: 'right', fontSize: 10 }}
                                />
                                <ReferenceLine
                                  y={REFERENCE_RANGES[key]?.max}
                                  stroke="#F59E0B"
                                  strokeDasharray="3 3"
                                  label={{ value: 'Max', position: 'right', fontSize: 10 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#0F4C81"
                                  strokeWidth={2}
                                  dot={{ r: 4, fill: '#0F4C81' }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-display mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Lab Results
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Healthcare Provider Email
                  </label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="provider@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    placeholder="Add a message for your healthcare provider..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    📋 A secure PDF report will be shared with the provider. They will receive a link to view your lab results.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      setShareEmail('');
                      setShareMessage('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90"
                  >
                    Share Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shared footer */}
        <footer className="w-full border-t border-border-light bg-white/90 mt-4">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <img src="/logo.ico" alt="Logo" className="w-5 h-5" />
              <span className="font-semibold">Table d'Adrian Wellness</span>
            </div>
            <span>Lab Results & Biomarkers</span>
          </div>
        </footer>
      </div>
      </div>
  );
}

