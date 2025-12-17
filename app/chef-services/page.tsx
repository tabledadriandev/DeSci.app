'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Utensils, BookOpen, Clock, DollarSign, ChefHat } from 'lucide-react';

export default function ChefServicesPage() {
  const { address } = useAccount();
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const services = [
    { id: 'consultation-15', name: '15-Min Consultation', duration: 15, price: 100, description: 'Quick nutrition and meal planning advice.', icon: Clock },
    { id: 'consultation-30', name: '30-Min Consultation', duration: 30, price: 200, description: 'Comprehensive meal plan review and customization.', icon: Clock },
    { id: 'consultation-60', name: '60-Min Deep Dive', duration: 60, price: 500, description: 'Complete nutrition strategy and longevity protocol.', icon: Clock },
    { id: 'custom-meal-plan', name: 'Custom Meal Plan', duration: null, price: 1000, description: 'Personalized meal plan tailored to your goals.', icon: BookOpen },
    { id: 'cooking-class', name: 'Private Cooking Class', duration: 120, price: 1500, description: 'Learn to cook with Chef Adrian.', icon: Utensils },
    { id: 'private-dining', name: 'Private Dining', duration: 180, price: 5000, description: 'Exclusive private dining experience.', icon: ChefHat },
  ];

  useEffect(() => {
    // Mock data for now
    setBookings([
      { id: 'b1', serviceName: 'Custom Meal Plan', dateTime: new Date().toISOString(), status: 'confirmed' },
      { id: 'b2', serviceName: '30-Min Consultation', dateTime: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
    ]);
    setLoading(false);
  }, [address]);

  const bookService = async (serviceId: string, dateTime: string) => {
    if (!address) return;
    console.log(`Booking service ${serviceId} for ${dateTime}`);
    // Simulate API call
    setBookings(prev => [...prev, { id: `b${prev.length + 1}`, serviceName: services.find(s => s.id === serviceId)?.name, dateTime, status: 'pending' }]);
    alert('Booking successful!');
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Chef Services
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Personalized culinary guidance and exclusive dining experiences.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading services..." />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div key={service.id} variants={fadeInUp} className="glass-card-hover p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-6 h-6 text-accent-primary" />
                      <h3 className="text-xl font-bold text-text-primary">{service.name}</h3>
                    </div>
                    <p className="text-text-secondary text-sm mb-4">{service.description}</p>
                    {service.duration && (
                      <p className="text-sm text-text-tertiary mb-2 flex items-center gap-1"><Clock className="w-4 h-4" /> {service.duration} minutes</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-2xl font-bold text-accent-primary flex items-center gap-1"><DollarSign className="w-5 h-5" /> {service.price} $TA</p>
                    <AnimatedButton size="sm" onClick={() => setSelectedService(service.id)}>
                      Book Now
                    </AnimatedButton>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Booking Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="glass-card p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-4">Book Service</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const dateTime = formData.get('dateTime') as string;
                  bookService(selectedService, dateTime);
                  setSelectedService(null);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-2 border border-border-medium rounded-lg bg-bg-surface text-text-primary"
                  />
                </div>
                <div className="flex gap-4">
                  <AnimatedButton type="button" variant="secondary" onClick={() => setSelectedService(null)} className="flex-1">
                    Cancel
                  </AnimatedButton>
                  <AnimatedButton type="submit" className="flex-1">
                    Confirm Booking
                  </AnimatedButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* My Bookings */}
        <motion.div className="glass-card p-6 mt-8" variants={fadeInUp} initial="hidden" animate="visible">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent-primary" /> My Bookings
          </h2>
          {bookings.length === 0 ? (
            <p className="text-text-secondary">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <motion.div key={booking.id} variants={fadeInUp} className="glass-card p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-text-primary">{booking.serviceName}</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(booking.dateTime).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-400/10 text-green-400'
                        : booking.status === 'pending'
                        ? 'bg-yellow-400/10 text-yellow-400'
                        : 'bg-gray-400/10 text-gray-400'
                    }`}
                  >
                    {booking.status}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}

