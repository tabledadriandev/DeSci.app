'use client';

import { useState, useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { Calendar, MapPin, Users, Ticket, ShoppingCart, X } from 'lucide-react';

export default function EventsPage() {
  const { address } = useAccount();
  const [events, setEvents] = useState<any[]>([]);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Mock data for now
    setEvents([
      { id: '1', name: 'Longevity Tech Expo', description: 'Explore the latest in anti-aging and biohacking technology.', image: 'https://images.unsplash.com/photo-1517048676732-d65bc9c5542e?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', date: new Date(Date.now() + 86400000 * 7).toISOString(), location: 'Virtual', capacity: 500, price: 50, available: true },
      { id: '2', name: 'Metabolic Optimization Workshop', description: 'Deep dive into metabolic health with leading experts.', image: 'https://images.unsplash.com/photo-1532150868-b3d5b2c7b5b0?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', date: new Date(Date.now() + 86400000 * 14).toISOString(), location: 'London, UK', capacity: 100, price: 150, available: true },
      { id: '3', name: 'DeSci Innovation Summit', description: 'A gathering of decentralized science pioneers.', image: 'https://images.unsplash.com/photo-1556761175-b413da4b9317?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', date: new Date(Date.now() + 86400000 * 21).toISOString(), location: 'New York, USA', capacity: 200, price: 200, available: false },
    ]);
    setUserTickets([
      { id: 't1', eventName: 'Metabolic Optimization Workshop', txHash: '0xabc123...', status: 'confirmed', date: new Date(Date.now() + 86400000 * 14).toISOString() },
    ]);
    setLoading(false);
  }, [address]);

  const purchaseTicket = async (eventId: string) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }
    console.log(`Purchasing ${quantity} tickets for event ${eventId}`);
    // Simulate API call
    const event = events.find(e => e.id === eventId);
    if (event) {
      setUserTickets(prev => [...prev, { id: `t${prev.length + 1}`, eventName: event.name, txHash: '0xmockTxHash', status: 'confirmed', date: new Date().toISOString() }]);
      alert('Tickets purchased successfully!');
    }
    setSelectedEvent(null);
    setQuantity(1);
  };

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Exclusive Events
          </h1>
          <p className="text-base text-text-secondary max-w-2xl">
            Join pioneers and experts at our curated longevity and Web3 events.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner text="Loading events..." />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {events.map((event) => (
              <motion.div key={event.id} variants={fadeInUp} className="glass-card-hover overflow-hidden">
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-48 object-cover object-center"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-primary mb-2">{event.name}</h3>
                  <p className="text-text-secondary text-sm mb-4">{event.description}</p>
                  <div className="space-y-2 text-sm text-text-tertiary mb-4">
                    <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent-secondary" /> {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent-secondary" /> {event.location}</p>
                    <p className="flex items-center gap-2"><Users className="w-4 h-4 text-accent-secondary" /> Capacity: {event.capacity}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-2xl font-bold text-accent-primary flex items-center gap-1"><Ticket className="w-6 h-6" /> {event.price} $TA</p>
                    <AnimatedButton
                      size="sm"
                      onClick={() => setSelectedEvent(event.id)}
                      disabled={!event.available}
                    >
                      {event.available ? 'Purchase Ticket' : 'Sold Out'}
                    </AnimatedButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Purchase Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="glass-card p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-accent-primary" /> Purchase Tickets
              </h2>
              <div className="mb-4">
                <p className="text-text-secondary mb-2">
                  Event: {events.find((e) => e.id === selectedEvent)?.name}
                </p>
                <p className="text-text-secondary mb-4">
                  Price: {events.find((e) => e.id === selectedEvent)?.price} $TA per ticket
                </p>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                />
                <p className="text-xl font-bold text-accent-primary mt-4 flex items-center gap-1">
                  Total: <Ticket className="w-5 h-5" /> {events.find((e) => e.id === selectedEvent)?.price * quantity} $TA
                </p>
              </div>
              <div className="flex gap-4">
                <AnimatedButton
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedEvent(null);
                    setQuantity(1);
                  }}
                  className="flex-1"
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => purchaseTicket(selectedEvent)}
                  className="flex-1"
                >
                  Confirm Purchase
                </AnimatedButton>
              </div>
            </motion.div>
          </div>
        )}

        {/* My Tickets */}
        {address && userTickets.length > 0 && (
          <motion.div className="glass-card p-6 mt-8" variants={fadeInUp} initial="hidden" animate="visible">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-accent-primary" /> My Tickets
            </h2>
            <div className="space-y-4">
              {userTickets.map((ticket) => (
                <motion.div key={ticket.id} variants={fadeInUp} className="glass-card p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-text-primary">{ticket.eventName}</p>
                    <p className="text-sm text-text-secondary">
                      Ticket ID: {ticket.id}
                    </p>
                    {ticket.txHash && (
                      <p className="text-xs text-text-tertiary mt-1">
                        TX: {ticket.txHash.slice(0, 10)}...
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-green-400/10 text-green-400 rounded-full text-sm font-medium">
                    Confirmed
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

