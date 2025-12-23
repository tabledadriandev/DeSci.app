'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedCard from '@/components/ui/AnimatedCard';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import { Database, Coins, BarChart3, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

interface DataLicensePurchase {
  id: string;
  purchaserName: string;
  purchaserType: string;
  licenseType: string;
  dataScope: string[];
  durationMonths: number;
  price: number;
  currency: string;
  paymentStatus: string;
  status: string;
  userRevenueShare: number;
  platformRevenue: number;
  createdAt: string;
  paidAt?: string | null;
}

export default function ResearchAdminPage() {
  const { address } = useAccount();
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState<DataLicensePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    purchaserType: '',
    status: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.purchaserType) params.set('purchaserType', filters.purchaserType);
        if (filters.status) params.set('status', filters.status);
        const res = await fetch(
          `/api/data-licensing/purchases${params.toString() ? `?${params}` : ''}`,
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load purchases');
        }
        const data = await res.json();
        setPurchases(data.purchases || []);
      } catch (e: any) {
        console.error('Error loading purchases:', e);
        showToast({
          title: 'Unable to load research licenses',
          description: e?.message || 'Please try again later.',
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters, showToast]);

  const totalUserRevenue = purchases.reduce((sum, p) => sum + (p.userRevenueShare || 0), 0);
  const totalPlatformRevenue = purchases.reduce((sum, p) => sum + (p.platformRevenue || 0), 0);

  return (
    <PageTransition>
      <div className="min-h-screen  p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <motion.div initial="initial" animate="animate" variants={fadeInUp}>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                Research &amp; Data Licensing
              </h1>
              <p className="text-sm md:text-base text-text-secondary max-w-2xl">
                Overview of anonymized data licensing deals, revenue split, and research partners.
              </p>
            </motion.div>
          </div>

          {/* Summary cards */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnimatedCard className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
                    Total Licenses
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {purchases.length.toString().padStart(2, '0')}
                  </div>
                </div>
              </AnimatedCard>
              <AnimatedCard className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
                    User Revenue Pool
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {totalUserRevenue.toFixed(2)} USD
                  </div>
                </div>
              </AnimatedCard>
              <AnimatedCard className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary">
                    Platform Revenue
                  </div>
                  <div className="text-2xl font-bold text-text-primary">
                    {totalPlatformRevenue.toFixed(2)} USD
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </motion.div>

          {/* Filters + table */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.15 }}
          >
            <AnimatedCard>
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-accent-primary" />
                <h2 className="text-lg font-semibold text-text-primary">Licenses</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Purchaser type
                  </label>
                  <select
                    value={filters.purchaserType}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, purchaserType: e.target.value }))
                    }
                    className="w-full border border-border-light rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    <option value="pharma">Pharma</option>
                    <option value="research_institution">Research Institution</option>
                    <option value="longevity_clinic">Longevity Clinic</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                    className="w-full border border-border-light rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="border border-border-light rounded-lg p-4">
                      <div className="flex justify-between mb-2 gap-4">
                        <div className="skeleton h-4 w-40 rounded-md" />
                        <div className="skeleton h-4 w-20 rounded-full" />
                      </div>
                      <div className="flex gap-3 mb-2">
                        <div className="skeleton h-3 w-24 rounded-md" />
                        <div className="skeleton h-3 w-24 rounded-md" />
                        <div className="skeleton h-3 w-24 rounded-md" />
                      </div>
                      <div className="skeleton h-3 w-32 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : purchases.length === 0 ? (
                <div className="text-sm text-text-secondary py-6 text-center">
                  No data licensing purchases yet. As deals are created, they will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {purchases.map((p, idx) => (
                      <motion.div key={p.id} variants={staggerItem}>
                        <div className="border border-border-light rounded-lg p-4 bg-white/80">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div>
                              <div className="text-sm font-semibold text-text-primary">
                                {p.purchaserName}
                              </div>
                              <div className="text-xs text-text-secondary">
                                {p.purchaserType.replace('_', ' ')}
                              </div>
                            </div>
                            <div className="text-right text-xs text-text-secondary">
                              <div>
                                {new Date(p.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                              <span
                                className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                                  p.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : p.status === 'expired'
                                    ? 'bg-gray-100 text-gray-700'
                                    : p.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 text-[11px] text-text-secondary mb-2">
                            <span>License: {p.licenseType.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>Duration: {p.durationMonths} months</span>
                            <span>•</span>
                            <span>Scope: {p.dataScope.join(', ')}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-2">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-text-primary">
                                Total: {p.price.toFixed(2)} {p.currency}
                              </span>
                              <span className="text-text-secondary">
                                40% users ({p.userRevenueShare.toFixed(2)}) • 60% platform (
                                {p.platformRevenue.toFixed(2)})
                              </span>
                            </div>
                            <div className="text-right text-[11px] text-text-secondary">
                              <div>Payment: {p.paymentStatus}</div>
                              {p.paidAt && (
                                <div>
                                  Paid{' '}
                                  {new Date(p.paidAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}
            </AnimatedCard>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}


