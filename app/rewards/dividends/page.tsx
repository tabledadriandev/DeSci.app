'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Coins, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

export default function DividendsPage() {
  const { address } = useAccount();
  const [dividends, setDividends] = useState<any[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadDividends();
    }
  }, [address]);

  const loadDividends = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/data-licensing/dividends/list?address=${address}`);
      const data = await response.json();

      if (response.ok) {
        setDividends(data.dividends || []);
        setTotalEarned(data.totalEarned || 0);
        setPendingCount(data.pendingCount || 0);
      }
    } catch (error) {
      console.error('Error loading dividends:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-display text-accent-primary mb-2">
            Data Licensing Dividends
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            Earn 40% of all data licensing revenue by opting in to share your anonymized health
            data for research.
          </p>
        </div>

        {!address && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Coins className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
            <h2 className="text-2xl font-display text-text-primary mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Please connect your wallet to view your dividend earnings.
            </p>
          </div>
        )}

        {address && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Total Earned</span>
                  <TrendingUp className="w-5 h-5 text-accent-primary" />
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <div className="text-2xl font-display text-accent-primary">
                    {totalEarned.toFixed(2)} $tabledadrian
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Pending</span>
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-10 mt-1" />
                ) : (
                  <div className="text-2xl font-display text-yellow-600">{pendingCount}</div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Total Payments</span>
                  <Coins className="w-5 h-5 text-text-secondary" />
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-10 mt-1" />
                ) : (
                  <div className="text-2xl font-display text-text-primary">{dividends.length}</div>
                )}
              </div>
            </div>

            {/* Dividends List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-display text-text-primary mb-4">Payment History</h2>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border border-border-light rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                      <Skeleton className="h-6 w-16 ml-4" />
                    </div>
                  ))}
                </div>
              ) : dividends.length === 0 ? (
                <div className="text-center py-12">
                  <Coins className="w-12 h-12 mx-auto mb-4 text-text-secondary opacity-50" />
                  <h3 className="text-lg font-display text-text-primary mb-2">No Dividends Yet</h3>
                  <p className="text-sm text-text-secondary max-w-md mx-auto">
                    Opt in to data sharing in Settings to start earning dividends from research data
                    licensing revenue.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dividends.map((dividend) => (
                    <div
                      key={dividend.id}
                      className="flex items-center justify-between p-4 border border-border-light rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-text-primary">
                            {dividend.amount.toFixed(4)} {dividend.currency}
                          </span>
                          {dividend.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {new Date(dividend.distributionDate).toLocaleDateString()} •{' '}
                          {dividend.sourceType === 'data_licensing'
                            ? 'Data Licensing'
                            : dividend.sourceType}
                          {dividend.usdValue && ` • ~$${dividend.usdValue.toFixed(2)} USD`}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            dividend.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : dividend.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {dividend.status}
                        </span>
                        {dividend.txHash && (
                          <a
                            href={`https://basescan.org/tx/${dividend.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-accent-primary mt-1 hover:underline"
                          >
                            View on BaseScan
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

