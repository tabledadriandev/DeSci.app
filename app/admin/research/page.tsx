'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Database, Coins, BarChart3, Filter, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  userRevenueShare: number;
  platformRevenue: number;
  createdAt: string;
  paidAt?: string | null;
}

const statusConfig = {
  active: { color: 'text-green-400', bgColor: 'bg-green-400/10' },
  expired: { color: 'text-gray-400', bgColor: 'bg-gray-400/10' },
  pending: { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  cancelled: { color: 'text-red-400', bgColor: 'bg-red-400/10' },
};

export default function ResearchAdminPage() {
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState<DataLicensePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ purchaserType: '', status: '' });

  useEffect(() => {
    // Mock data for now
    setPurchases([
      { id: '1', purchaserName: 'PharmaCorp', purchaserType: 'pharma', licenseType: 'premium', dataScope: ['biomarkers', 'symptoms'], durationMonths: 12, price: 10000, currency: 'USD', paymentStatus: 'paid', status: 'active', userRevenueShare: 4000, platformRevenue: 6000, createdAt: new Date().toISOString(), paidAt: new Date().toISOString() },
      { id: '2', purchaserName: 'Longevity Labs', purchaserType: 'research_institution', licenseType: 'standard', dataScope: ['biomarkers'], durationMonths: 6, price: 5000, currency: 'USD', paymentStatus: 'paid', status: 'expired', userRevenueShare: 2000, platformRevenue: 3000, createdAt: new Date().toISOString(), paidAt: new Date().toISOString() },
    ]);
    setLoading(false);
  }, [filters, showToast]);

  const totalUserRevenue = purchases.reduce((sum, p) => sum + p.userRevenueShare, 0);
  const totalPlatformRevenue = purchases.reduce((sum, p) => sum + p.platformRevenue, 0);

  const summaryStats = [
    { label: 'Total Licenses', value: purchases.length, icon: Database, color: 'text-blue-400' },
    { label: 'User Revenue Pool', value: `$${totalUserRevenue.toLocaleString()}`, icon: Coins, color: 'text-green-400' },
    { label: 'Platform Revenue', value: `$${totalPlatformRevenue.toLocaleString()}`, icon: BarChart3, color: 'text-purple-400' },
  ];

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
              Research & Data Licensing
            </h1>
            <p className="text-base text-text-secondary max-w-2xl">
              Overview of anonymized data licensing deals and revenue splits.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {summaryStats.map((stat) => (
            <motion.div key={stat.label} variants={fadeInUp} className="glass-card-hover p-6 flex items-center gap-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-6 h-6 text-accent-primary" />
              <h2 className="text-xl font-semibold text-text-primary">Licenses</h2>
            </div>
            <div className="flex gap-4">
              {/* Filter components would go here */}
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner text="Loading licenses..." />
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((p) => <PurchaseItem key={p.id} {...p} />)}
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}

function PurchaseItem(purchase: DataLicensePurchase) {
  const { color, bgColor } = statusConfig[purchase.status];

  return (
    <motion.div variants={fadeInUp} className="border border-border-light rounded-lg p-4 bg-bg-surface/50 hover:bg-bg-surface/80 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h3 className="text-base font-semibold text-text-primary">{purchase.purchaserName}</h3>
          <p className="text-sm text-text-secondary capitalize">{purchase.purchaserType.replace('_', ' ')}</p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bgColor} ${color}`}>
          {purchase.status}
        </span>
      </div>
      <div className="text-sm text-text-secondary mb-4">
        {purchase.dataScope.join(', ')} - {purchase.durationMonths} months
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-text-secondary">User Revenue</p>
          <p className="text-lg font-bold text-green-400">${purchase.userRevenueShare.toLocaleString()}</p>
        </div>
        <p className="text-xl font-bold text-text-primary">${purchase.price.toLocaleString()}</p>
      </div>
    </motion.div>
  );
}


