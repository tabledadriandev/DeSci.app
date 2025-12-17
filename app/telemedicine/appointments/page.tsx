'use client';

import { useEffect, useState } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { CalendarDays, Clock, Stethoscope, Video } from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  id: string;
  startTime: string;
  endTime?: string | null;
  status: string;
  reason?: string | null;
  provider: {
    id: string;
    fullName: string;
    type: string;
  };
}

export default function TelemedicineAppointmentsPage() {
  const { address } = useAccount();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setAppointments([
      { id: '1', startTime: new Date(Date.now() + 86400000).toISOString(), status: 'confirmed', reason: 'Follow-up on biomarker results', provider: { id: 'p1', fullName: 'Dr. Eva Rostova', type: 'Longevity Specialist' } },
      { id: '2', startTime: new Date(Date.now() - 86400000 * 7).toISOString(), endTime: new Date(Date.now() - 86400000 * 7 + 1800000).toISOString(), status: 'completed', reason: 'Initial consultation', provider: { id: 'p2', fullName: 'Dr. Kenji Tanaka', type: 'Nutritionist' } },
      { id: '3', startTime: new Date(Date.now() + 86400000 * 3).toISOString(), status: 'pending', reason: 'Review sleep data', provider: { id: 'p1', fullName: 'Dr. Eva Rostova', type: 'Longevity Specialist' } },
    ]);
    setLoading(false);
  }, [address]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-semantic-success/10 text-semantic-success border-semantic-success/20';
      case 'confirmed':
        return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'pending':
        return 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20';
      case 'cancelled':
        return 'bg-semantic-error/10 text-semantic-error border-semantic-error/20';
      default:
        return 'bg-bg-elevated text-text-secondary border-border-medium';
    }
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Telemedicine Appointments
          </h1>
          <p className="text-base text-text-secondary">
            Manage your virtual consultations with our network of specialists.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading your appointments..." />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto mt-8">
            {appointments.length === 0 ? (
              <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card text-center py-12">
                <Video className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">No appointments yet</h2>
                <p className="text-text-secondary mb-6">
                  Book your first video consultation from the Telemedicine & Care page.
                </p>
                <Link href="/telemedicine">
                  <AnimatedButton>Go to Telemedicine</AnimatedButton>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {appointments.map((appt) => {
                  const start = new Date(appt.startTime);
                  const end = appt.endTime ? new Date(appt.endTime) : null;
                  return (
                    <motion.div
                      key={appt.id}
                      variants={fadeInUp}
                      className="glass-card-hover p-6 flex flex-col gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Stethoscope className="w-5 h-5 text-accent-primary" />
                            <p className="font-semibold text-lg text-text-primary">
                              {appt.provider.fullName}
                            </p>
                          </div>
                          <p className="text-sm text-text-secondary">
                            {appt.provider.type}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appt.status)}`}>
                          {appt.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-text-secondary">
                        <p className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> {start.toLocaleDateString()}</p>
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {end && ` - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                      </div>
                      {appt.reason && (
                        <div className="text-sm text-text-primary border-t border-border-medium pt-3 mt-1">
                          <strong className="text-text-secondary">Reason:</strong> {appt.reason}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}


