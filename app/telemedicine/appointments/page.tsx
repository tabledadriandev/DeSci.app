'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { CalendarDays, Clock, Stethoscope, Video } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/telemedicine/appointments/list?userId=${encodeURIComponent(address)}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data?.appointments) {
          setAppointments(data.appointments);
        }
      } catch {
        // ignore for now
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [address]);

  return (
    <div className="min-h-screen  flex flex-col">
      <header className="w-full border-b border-border-light bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => window.location.assign('/telemedicine')}
              className="px-3 py-1 text-xs sm:text-sm border border-border-light rounded-full hover:bg-cream whitespace-nowrap"
            >
              Telemedicine
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <img src="/logo.ico" alt="Logo" className="w-6 h-6 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base">
                Table d&apos;Adrian Wellness
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-accent-primary flex items-center gap-2">
              <CalendarDays className="w-6 h-6" />
              Telemedicine Appointments
            </h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-40 rounded-md" />
                      <div className="skeleton h-3 w-24 rounded-md" />
                    </div>
                    <div className="skeleton h-5 w-16 rounded-full" />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <div className="skeleton h-3 w-24 rounded-md" />
                    <div className="skeleton h-3 w-28 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Video className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h2 className="text-lg font-semibold mb-2">No appointments yet</h2>
              <p className="text-sm text-text-secondary mb-4">
                Book your first video consultation from the Telemedicine &amp; Care page.
              </p>
              <a
                href="/telemedicine"
                className="btn-primary text-sm px-5 py-2 inline-flex items-center justify-center"
              >
                Go to Telemedicine
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((appt) => {
                const start = new Date(appt.startTime);
                const end = appt.endTime ? new Date(appt.endTime) : null;
                return (
                  <div
                    key={appt.id}
                    className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Stethoscope className="w-4 h-4 text-accent-primary" />
                          <span className="font-semibold text-sm sm:text-base text-text-primary">
                            {appt.provider.fullName}
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary">
                          {appt.provider.type || 'Healthcare Provider'}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] uppercase tracking-wide ${
                          appt.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : appt.status === 'completed'
                            ? 'bg-gray-100 text-gray-700'
                            : appt.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {start.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {end && (
                          <>
                            {' – '}
                            {end.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </>
                        )}
                      </div>
                    </div>

                    {appt.reason && (
                      <div className="text-xs sm:text-sm text-text-secondary border-t border-border-light pt-3 mt-1">
                        <span className="font-medium text-text-primary">Reason:</span>{' '}
                        {appt.reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


