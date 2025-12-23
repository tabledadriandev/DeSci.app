'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function ChefServicesPage() {
  const { address } = useAccount();
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const services = [
    {
      id: 'consultation-15',
      name: '15-Minute Consultation',
      duration: 15,
      price: 100, // $tabledadrian tokens
      description: 'Quick nutrition and meal planning advice',
    },
    {
      id: 'consultation-30',
      name: '30-Minute Consultation',
      duration: 30,
      price: 200,
      description: 'Comprehensive meal plan review and customization',
    },
    {
      id: 'consultation-60',
      name: '60-Minute Deep Dive',
      duration: 60,
      price: 500,
      description: 'Complete nutrition strategy and longevity protocol',
    },
    {
      id: 'custom-meal-plan',
      name: 'Custom Meal Plan Design',
      duration: null,
      price: 1000,
      description: 'Personalized meal plan tailored to your goals',
    },
    {
      id: 'cooking-class',
      name: 'Private Cooking Class',
      duration: 120,
      price: 1500,
      description: 'Learn to cook with Chef Adrian',
    },
    {
      id: 'private-dining',
      name: 'Private Dining Experience',
      duration: 180,
      price: 5000,
      description: 'Exclusive private dining event',
    },
  ];

  useEffect(() => {
    if (address) {
      loadBookings();
    }
  }, [address]);

  const loadBookings = async () => {
    try {
      const response = await fetch(`/api/chef/bookings?address=${address}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const bookService = async (serviceId: string, dateTime: string) => {
    if (!address) return;

    try {
      const response = await fetch('/api/chef/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          serviceId,
          dateTime,
        }),
      });

      if (response.ok) {
        await loadBookings();
        alert('Booking successful!');
      } else {
        const error = await response.json();
        alert(error.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Error booking service:', error);
      alert('Booking failed');
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8">
          Chef Services
        </h1>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-display text-text-primary mb-2">
                {service.name}
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                {service.description}
              </p>
              {service.duration && (
                <div className="text-sm text-text-secondary mb-2">
                  ⏱️ {service.duration} minutes
                </div>
              )}
              <div className="text-2xl font-display text-accent-primary mb-4">
                {service.price} $tabledadrian
              </div>
              <button
                onClick={() => setSelectedService(service.id)}
                className="w-full bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>

        {/* Booking Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-display mb-4">Book Service</h2>
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
                  <label className="block text-sm font-medium mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-display mb-4">My Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-text-secondary">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{booking.serviceName}</div>
                      <div className="text-sm text-text-secondary">
                        {new Date(booking.dateTime).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

