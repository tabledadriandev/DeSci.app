'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Video, CalendarDays, Stethoscope, Clock, PhoneCall, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

type UiProvider = {
  id: string;
  name: string;
  specialty: string;
  languages: string[];
  experience?: string;
  nextAvailable?: string;
};

const FALLBACK_PROVIDERS: UiProvider[] = [
  {
    id: 'dr-smith-demo',
    name: 'Dr. Alexandra Smith, MD',
    specialty: 'Internal Medicine • Longevity & Preventive Care',
    languages: ['English', 'Spanish'],
    experience: '12+ years',
    nextAvailable: 'Today · 16:30',
  },
  {
    id: 'dr-lee-demo',
    name: 'Dr. Daniel Lee, MD',
    specialty: 'Cardiology • Sports Medicine',
    languages: ['English'],
    experience: '9+ years',
    nextAvailable: 'Tomorrow · 09:15',
  },
  {
    id: 'dr-khan-demo',
    name: 'Dr. Aisha Khan, MD',
    specialty: 'Endocrinology • Metabolism',
    languages: ['English', 'Arabic'],
    experience: '10+ years',
    nextAvailable: 'In 2 days · 14:00',
  },
];

export default function TelemedicinePage() {
  const { address } = useAccount();
  const router = useRouter();
  const [providers, setProviders] = useState<UiProvider[]>(FALLBACK_PROVIDERS);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(FALLBACK_PROVIDERS[0]?.id ?? null);
  const [reason, setReason] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const res = await fetch('/api/providers/list');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.providers && Array.isArray(data.providers) && data.providers.length > 0) {
          const mapped: UiProvider[] = data.providers.map((p: any) => ({
            id: p.id,
            name: p.fullName,
            specialty: (p.specialties && p.specialties.length > 0) ? p.specialties.join(' • ') : p.type,
            languages: p.languages && p.languages.length > 0 ? p.languages : ['English'],
            experience: p.yearsExperience ? `${p.yearsExperience}+ years` : undefined,
            nextAvailable: undefined,
          }));
          setProviders(mapped);
          setSelectedProviderId(mapped[0]?.id ?? null);
        }
      } catch {
        // silently keep fallback providers
      }
    };

    loadProviders();
  }, []);

  const provider = useMemo(
    () => providers.find((p) => p.id === selectedProviderId) ?? providers[0],
    [providers, selectedProviderId],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      showToast({
        title: 'Connect your wallet',
        description: 'Please connect your wallet or log in before booking a consultation.',
        variant: 'info',
      });
      return;
    }
    if (!provider) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/telemedicine/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          providerId: provider.id,
          startTime: new Date().toISOString(),
          reason,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errorMessage = err.error || 'Unable to book appointment right now.';
        setMessage(errorMessage);
        showToast({
          title: 'Booking failed',
          description: errorMessage,
          variant: 'error',
        });
      } else {
        const successMessage =
          'Appointment request created. You can review it in your Telemedicine Appointments.';
        setMessage(successMessage);
        showToast({
          title: 'Appointment requested',
          description: successMessage,
          variant: 'success',
        });
        setReason('');
        setPreferredTime('');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      const msg = 'Something went wrong while booking. Please try again.';
      setMessage(msg);
      showToast({
        title: 'Unexpected error',
        description: msg,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen  flex flex-col">
      {/* Simple top nav consistent with other pages */}
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

      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Left: Provider list */}
          <section className="bg-white rounded-xl shadow-md p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Stethoscope className="w-6 h-6 text-accent-primary" />
              <h1 className="text-xl sm:text-2xl font-sans font-bold text-accent-primary">
                Telemedicine & Care Team
              </h1>
            </div>
            <p className="text-sm text-text-secondary mb-2">
              Connect with licensed clinicians for video consultations, follow-up visits and ongoing care.
            </p>

            <div className="space-y-3">
              {providers.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedProviderId(doc.id)}
                  className={`w-full text-left border rounded-lg p-3 transition flex flex-col gap-1 ${
                    selectedProviderId === doc.id
                      ? 'border-accent-primary bg-accent-primary/5'
                      : 'border-border-light hover:bg-cream/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm sm:text-base text-text-primary">
                        {doc.name}
                      </div>
                      <div className="text-xs sm:text-sm text-text-secondary">{doc.specialty}</div>
                    </div>
                    <span className="px-2 py-1 text-[11px] sm:text-xs rounded-full bg-cream text-accent-primary">
                      Next: {doc.nextAvailable}
                    </span>
                  </div>
                    <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-text-secondary">
                      {doc.experience && <span>Experience: {doc.experience}</span>}
                      <span>•</span>
                      <span>Languages: {doc.languages.join(', ')}</span>
                    </div>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-cream/60 p-3 text-xs sm:text-sm text-text-secondary flex gap-3">
              <Video className="w-4 h-4 text-accent-primary mt-0.5" />
              <div>
                <div className="font-semibold text-text-primary mb-1">How it works</div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Select a provider and share why you’re booking.</li>
                  <li>We’ll match you with the best available time slot.</li>
                  <li>Join your visit via secure, HIPAA-ready video link.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Right: Request form */}
          <section className="bg-white rounded-xl shadow-md p-5 flex flex-col">
            <h2 className="text-lg sm:text-xl font-sans font-semibold mb-3 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-accent-primary" />
              Request a Video Consultation
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Book a secure video consultation with your care team. Your latest health data can be shared
              with the provider through the records section.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Selected provider
                </label>
                <div className="rounded-lg border border-border-light bg-cream/40 p-3 text-sm">
                  <div className="font-semibold text-text-primary">{provider.name}</div>
                  <div className="text-xs text-text-secondary mb-1">{provider.specialty}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Next: {provider.nextAvailable}
                    </span>
                    <span className="flex items-center gap-1">
                      <PhoneCall className="w-3 h-3" /> Video & audio
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Confirmation by email
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  What would you like to discuss?
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-border-light rounded-lg px-3 py-2 text-sm min-h-[90px]"
                  placeholder="e.g. review recent lab results, optimize sleep, discuss ongoing symptoms..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Preferred time (optional)
                </label>
                <input
                  type="text"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full border border-border-light rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Weekdays after 18:00, Saturday morning"
                />
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-text-secondary max-w-md">
                  In a full deployment, video calls and clinical records would be handled through secure,
                  compliant infrastructure.
                </p>
                <div className="flex items-center gap-3">
                  {message && (
                    <span className="text-[11px] text-text-secondary max-w-xs">
                      {message}
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-accent-primary text-white text-sm font-semibold hover:bg-accent-primary/90 disabled:opacity-50"
                  >
                    {submitting ? 'Requesting...' : 'Request Consultation'}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}


