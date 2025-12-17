'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Video, CalendarDays, Stethoscope, Clock, PhoneCall, Mail, User, Send } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

type UiProvider = {
  id: string;
  name: string;
  specialty: string;
  languages: string[];
  experience?: string;
  nextAvailable?: string;
};

export default function TelemedicinePage() {
  const { address } = useAccount();
  const [providers, setProviders] = useState<UiProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setProviders([
      { id: 'dr-smith-demo', name: 'Dr. Alexandra Smith, MD', specialty: 'Internal Medicine • Longevity & Preventive Care', languages: ['English', 'Spanish'], experience: '12+ years', nextAvailable: 'Today · 16:30' },
      { id: 'dr-lee-demo', name: 'Dr. Daniel Lee, MD', specialty: 'Cardiology • Sports Medicine', languages: ['English'], experience: '9+ years', nextAvailable: 'Tomorrow · 09:15' },
      { id: 'dr-khan-demo', name: 'Dr. Aisha Khan, MD', specialty: 'Endocrinology • Metabolism', languages: ['English', 'Arabic'], experience: '10+ years', nextAvailable: 'In 2 days · 14:00' },
    ]);
    setSelectedProviderId('dr-smith-demo');
    setLoading(false);
  }, []);

  const provider = useMemo(
    () => providers.find((p) => p.id === selectedProviderId) ?? providers[0],
    [providers, selectedProviderId],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      showToast({ title: 'Connect your wallet', description: 'Please connect your wallet before booking.', variant: 'info' });
      return;
    }
    setSubmitting(true);
    // Mock API call
    setTimeout(() => {
      showToast({ title: 'Appointment requested', description: 'Your request has been sent. You will be notified by email.', variant: 'success' });
      setReason('');
      setPreferredTime('');
      setSubmitting(false);
    }, 1500);
  };

  return (
    <PageTransition>
      <div className="page-container">
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="page-header">
          <h1 className="page-title">Telemedicine & Care Team</h1>
          <p className="page-subtitle max-w-3xl">
            Connect with licensed clinicians for video consultations, follow-up visits, and ongoing care.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading providers..." />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            {/* Left: Provider list */}
            <motion.section variants={fadeInUp} className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Stethoscope className="w-6 h-6 text-accent-primary" />
                <h2 className="text-2xl font-bold text-text-primary">
                  Our Specialists
                </h2>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                Select a provider to start your booking request.
              </p>

              <div className="space-y-3">
                {providers.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedProviderId(doc.id)}
                    className={`glass-card-hover w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedProviderId === doc.id
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-border-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-text-primary">{doc.name}</p>
                        <p className="text-xs text-text-secondary">{doc.specialty}</p>
                      </div>
                      <div className="text-xs font-bold text-semantic-success">{doc.nextAvailable}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>

            {/* Right: Request form */}
            <motion.section variants={fadeInUp} className="lg:col-span-3 glass-card p-6 flex flex-col">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-text-primary">
                <CalendarDays className="w-6 h-6 text-accent-primary" />
                Request a Video Consultation
              </h2>
              
              {provider && (
                <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                  <div className="glass-card p-4">
                    <p className="block text-sm font-medium text-text-secondary mb-2">
                      Selected provider
                    </p>
                    <div className="flex items-center gap-3">
                      <User className="w-8 h-8 text-accent-primary" />
                      <div>
                        <p className="font-semibold text-text-primary">{provider.name}</p>
                        <p className="text-xs text-text-secondary">{provider.specialty}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="form-label">What would you like to discuss?</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="form-textarea"
                      placeholder="e.g., review recent lab results, optimize sleep, discuss ongoing symptoms..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="form-label">Preferred time (optional)</label>
                    <input
                      type="text"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="form-input"
                      placeholder="e.g., Weekdays after 18:00, Saturday morning"
                    />
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-border-medium">
                    <p className="text-xs text-text-tertiary max-w-xs">
                      A secure, HIPAA-ready video link will be sent to your email upon confirmation.
                    </p>
                    <AnimatedButton
                      type="submit"
                      disabled={submitting}
                      icon={<Send className="w-5 h-5" />}
                    >
                      {submitting ? 'Requesting...' : 'Request Consultation'}
                    </AnimatedButton>
                  </div>
                </form>
              )}
            </motion.section>
          </div>
        )}
      </div>
    </PageTransition>
  );
}


