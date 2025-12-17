'use client';

import { useEffect, useState } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import { FileText, Share2, Stethoscope, Upload, Wallet, FolderKanban } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

interface MedicalRecord {
  id: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  createdAt: string;
  provider?: {
    id: string;
    fullName: string;
  } | null;
  sharedWithProviderIds: string[];
}

export default function TelemedicineRecordsPage() {
  const { address } = useAccount();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Mock data for now
    setRecords([
      { id: '1', title: 'Blood Panel - Nov 2025', description: 'Comprehensive metabolic panel and lipid profile.', fileUrl: '#', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), provider: { id: 'p1', fullName: 'Dr. Eva Rostova' }, sharedWithProviderIds: [] },
      { id: '2', title: 'Cardiology Consultation Summary', description: 'Follow-up on stress test results.', fileUrl: '#', createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), provider: { id: 'p2', fullName: 'Dr. Kenji Tanaka' }, sharedWithProviderIds: ['p1'] },
    ]);
    setLoading(false);
  }, [address]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !title) return;

    setSubmitting(true);
    // Mock API call
    setTimeout(() => {
      const newRecord: MedicalRecord = { id: (Math.random()*1000).toString(), title, description, fileUrl, createdAt: new Date().toISOString(), sharedWithProviderIds: [] };
      setRecords((prev) => [newRecord, ...prev]);
      setTitle('');
      setDescription('');
      setFileUrl('');
      setSubmitting(false);
      showToast({ title: 'Record saved', description: 'Your medical record has been added.', variant: 'success' });
    }, 1500);
  };

  if (!address) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card max-w-md w-full text-center p-8">
            <Wallet className="w-16 h-16 text-accent-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">Connect Your Wallet</h2>
            <p className="text-text-secondary">Please connect your wallet to manage your medical records.</p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Medical Records & Documents
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Securely store and manage your health records, lab results, and consultation notes.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Upload section */}
          <motion.section variants={fadeInUp} className="glass-card p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-text-primary">
              <Upload className="w-6 h-6 text-accent-primary" /> Add a Record
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Store metadata and links to lab PDFs, imaging reports, or letters. Physical storage is handled by a secure, compliant provider.
            </p>
            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                placeholder="e.g. Blood panel – Nov 2025"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                rows={3}
                placeholder="Short note about this record…"
              />
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                placeholder="https://secure-storage/your-report.pdf"
              />
              <div className="flex justify-end">
                <AnimatedButton type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Record'}
                </AnimatedButton>
              </div>
            </form>
          </motion.section>

          {/* Records list */}
          <motion.section variants={fadeInUp} className="glass-card p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-accent-primary" /> Your Records
            </h2>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <LoadingSpinner text="Loading records..." />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <p>No records saved yet. Use the form above to add your first lab result or document.</p>
              </div>
            ) : (
              <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="visible">
                {records.map((record) => (
                  <motion.div
                    key={record.id}
                    variants={fadeInUp}
                    className="glass-card-hover p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-text-primary">{record.title}</p>
                        {record.description && (
                          <p className="text-sm text-text-secondary mt-1">{record.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 text-xs">
                        {record.provider && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-400/10 text-blue-400 font-medium">
                            <Stethoscope className="w-3 h-3" />
                            {record.provider.fullName}
                          </span>
                        )}
                        {record.sharedWithProviderIds.length > 0 && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-semantic-success/10 text-semantic-success font-medium">
                            <Share2 className="w-3 h-3" />
                            Shared
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t border-border-medium">
                      <p>
                        Added on {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                      {record.fileUrl && (
                        <a
                          href={record.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-accent-primary hover:underline"
                        >
                          <FileText className="w-3 h-3" />
                          Open file
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.section>
        </div>
      </div>
    </PageTransition>
  );
}
