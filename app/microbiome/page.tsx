'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Brain, 
  Droplet, 
  AlertTriangle,
  Upload,
  BarChart3,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function MicrobiomePage() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [latestResult, setLatestResult] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [correlations, setCorrelations] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    if (address) {
      loadMicrobiomeData();
      loadCorrelations();
    }
  }, [address, timeframe]);

  const loadMicrobiomeData = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/microbiome/analyze?userId=${address}`);
      const data = await response.json();
      
      if (data.success) {
        setLatestResult(data.result);
        setTrends(data.trends);
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error loading microbiome data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCorrelations = async () => {
    if (!address) return;
    
    try {
      const response = await fetch(`/api/microbiome/correlations?userId=${address}&timeframe=${timeframe}`);
      const data = await response.json();
      
      if (data.success) {
        setCorrelations(data);
      }
    } catch (error) {
      console.error('Error loading correlations:', error);
    }
  };

  const formatCorrelation = (corr: number | undefined): string => {
    if (corr === undefined || corr === null) return 'N/A';
    const percentage = (corr * 100).toFixed(1);
    const sign = corr > 0 ? '+' : '';
    return `${sign}${percentage}%`;
  };

  const getDiversityStatus = (shannonIndex: number | null | undefined): { status: string; color: string } => {
    if (!shannonIndex) return { status: 'Unknown', color: 'gray' };
    if (shannonIndex > 4.0) return { status: 'Excellent', color: 'green' };
    if (shannonIndex > 3.0) return { status: 'Good', color: 'blue' };
    if (shannonIndex > 2.0) return { status: 'Fair', color: 'yellow' };
    return { status: 'Low', color: 'red' };
  };

  if (loading) {
    return (
      <div className="min-h-screen  p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-accent-primary animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!latestResult) {
    return (
      <div className="min-h-screen  p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-8 h-8 text-accent-primary" />
            <h1 className="text-4xl font-display text-accent-primary">Microbiome Analysis</h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-8 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Microbiome Data Yet</h2>
            <p className="text-text-secondary mb-6">
              Upload your microbiome test results from Viome, Ombre, Tiny Health, or Thorne to get started.
            </p>
            <button className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 flex items-center gap-2 mx-auto">
              <Upload className="w-5 h-5" />
              Upload Test Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  const diversityStatus = getDiversityStatus(latestResult.shannonIndex);

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-accent-primary" />
            <h1 className="text-4xl font-display text-accent-primary">Microbiome Analysis</h1>
          </div>
          <button
            onClick={loadMicrobiomeData}
            className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Diversity Score */}
        <div
          className="bg-white rounded-xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Diversity Score</h2>
            <span className={`px-4 py-1 rounded-full text-sm font-medium bg-${diversityStatus.color}-100 text-${diversityStatus.color}-800`}>
              {diversityStatus.status}
            </span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-5xl font-bold text-accent-primary">
              {latestResult.shannonIndex?.toFixed(2) || 'N/A'}
            </span>
            <span className="text-text-secondary">Shannon Index</span>
          </div>
          {trends && trends.diversityTrend !== 'insufficient_data' && (
            <div className="flex items-center gap-2 mt-4">
              {trends.diversityTrend === 'increasing' ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : trends.diversityTrend === 'decreasing' ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
              ) : null}
              <span className="text-sm text-text-secondary">
                {trends.diversityTrend === 'increasing' && 'Improving'}
                {trends.diversityTrend === 'decreasing' && 'Declining'}
                {trends.diversityTrend === 'stable' && 'Stable'}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Phyla Distribution */}
          <div
            className="bg-white rounded-xl shadow-xl p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Phyla Distribution
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Firmicutes</span>
                  <span className="text-sm font-medium">{latestResult.firmicutesPercentage?.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${latestResult.firmicutesPercentage || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Bacteroidetes</span>
                  <span className="text-sm font-medium">{latestResult.bacteroidetesPercentage?.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${latestResult.bacteroidetesPercentage || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Actinobacteria</span>
                  <span className="text-sm font-medium">{latestResult.actinobacteriaPercentage?.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${latestResult.actinobacteriaPercentage || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Proteobacteria</span>
                  <span className="text-sm font-medium">{latestResult.proteobacteriaPercentage?.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${latestResult.proteobacteriaPercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Health Indicators */}
          <div
            className="bg-white rounded-xl shadow-xl p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Health Indicators
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Inflammation Risk</span>
                  <span className={`text-sm font-bold ${
                    (latestResult.inflammationRisk || 0) > 7 ? 'text-red-600' :
                    (latestResult.inflammationRisk || 0) < 3 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {(latestResult.inflammationRisk || 0).toFixed(1)}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (latestResult.inflammationRisk || 0) > 7 ? 'bg-red-500' :
                      (latestResult.inflammationRisk || 0) < 3 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${((latestResult.inflammationRisk || 0) / 10) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Gut Permeability Risk</span>
                  <span className={`text-sm font-bold ${
                    (latestResult.gutPermeabilityRisk || 0) > 7 ? 'text-red-600' :
                    (latestResult.gutPermeabilityRisk || 0) < 3 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {(latestResult.gutPermeabilityRisk || 0).toFixed(1)}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (latestResult.gutPermeabilityRisk || 0) > 7 ? 'bg-red-500' :
                      (latestResult.gutPermeabilityRisk || 0) < 3 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${((latestResult.gutPermeabilityRisk || 0) / 10) * 100}%` }}
                  />
                </div>
              </div>
              {latestResult.digestionScore !== null && latestResult.digestionScore !== undefined && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Digestion Score</span>
                    <span className="text-sm font-bold text-accent-primary">
                      {latestResult.digestionScore.toFixed(0)}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-accent-primary h-2 rounded-full"
                      style={{ width: `${latestResult.digestionScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Beneficial Bacteria */}
        {latestResult.akkermansiaMuciniphila || latestResult.bifidobacterium || latestResult.lactobacillus ? (
          <div
            className="bg-white rounded-xl shadow-xl p-6 mb-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5" />
              Key Beneficial Bacteria
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {latestResult.akkermansiaMuciniphila !== null && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(latestResult.akkermansiaMuciniphila * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-text-secondary mt-1">Akkermansia</div>
                </div>
              )}
              {latestResult.bifidobacterium !== null && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {(latestResult.bifidobacterium * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-text-secondary mt-1">Bifidobacterium</div>
                </div>
              )}
              {latestResult.lactobacillus !== null && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {(latestResult.lactobacillus * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-text-secondary mt-1">Lactobacillus</div>
                </div>
              )}
              {latestResult.faecalibacteriumPrausnitzii !== null && (
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {(latestResult.faecalibacteriumPrausnitzii * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-text-secondary mt-1">Faecalibacterium</div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Insights */}
        {insights.length > 0 && (
          <div
            className="bg-white rounded-xl shadow-xl p-6 mb-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Insights & Recommendations
            </h3>
            <ul className="space-y-2">
              {insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-accent-primary mt-1">•</span>
                  <span className="text-text-primary">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gut-Brain Axis Correlations */}
        {correlations && (
          <div
            className="bg-white rounded-xl shadow-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Gut-Brain Axis Correlations
              </h3>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'quarter')}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>
            
            {correlations.correlations && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-text-secondary mb-1">Diversity ↔ Mood</div>
                  <div className="text-2xl font-bold">
                    {formatCorrelation(correlations.correlations.diversityMoodCorrelation)}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-text-secondary mb-1">Diversity ↔ Stress</div>
                  <div className="text-2xl font-bold">
                    {formatCorrelation(correlations.correlations.diversityStressCorrelation)}
                  </div>
                </div>
              </div>
            )}

            {correlations.serotoninAnalysis && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2">Serotonin Production Potential</h4>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {correlations.serotoninAnalysis.serotoninProductionPotential.toFixed(0)}/100
                </div>
                <div className="text-sm text-text-secondary">
                  Availability: {correlations.serotoninAnalysis.tryptophanAvailability}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pathogens Alert */}
        {latestResult.pathogens && Array.isArray(latestResult.pathogens) && latestResult.pathogens.some((p: any) => p.presence) && (
          <div
            className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Pathogens Detected</h4>
                <ul className="space-y-1">
                  {latestResult.pathogens
                    .filter((p: any) => p.presence)
                    .map((pathogen: any, idx: number) => (
                      <li key={idx} className="text-red-700">
                        • {pathogen.name} ({pathogen.level || 'unknown'})
                      </li>
                    ))}
                </ul>
                <p className="text-sm text-red-600 mt-2">
                  Consider consulting a healthcare provider for guidance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

