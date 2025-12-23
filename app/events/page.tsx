'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function EventsPage() {
  const { address } = useAccount();
  const [events, setEvents] = useState<any[]>([]);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (address) {
      loadEvents();
    } else {
      loadEvents();
    }
  }, [address]);

  const loadEvents = async () => {
    try {
      const response = await fetch(`/api/events?address=${address || ''}`);
      const data = await response.json();
      setEvents(data.events || []);
      setUserTickets(data.userTickets || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseTicket = async (eventId: string) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      const response = await fetch('/api/events/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          eventId,
          quantity,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await loadEvents();
        setSelectedEvent(null);
        alert(`Tickets purchased successfully! ${data.data.onChain ? 'Transaction confirmed on-chain.' : 'Processing off-chain.'}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      alert('Purchase failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen  p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-display text-accent-primary mb-8">
          Exclusive Events
        </h1>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              {event.image && (
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-display text-text-primary mb-2">
                  {event.name}
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {event.description}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-text-secondary">
                    📅 {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-sm text-text-secondary">
                    📍 {event.location}
                  </div>
                  <div className="text-sm text-text-secondary">
                    👥 Capacity: {event.capacity}
                  </div>
                </div>
                <div className="text-2xl font-display text-accent-primary mb-4">
                  {event.price} $tabledadrian
                </div>
                <button
                  onClick={() => setSelectedEvent(event.id)}
                  disabled={!event.available}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    event.available
                      ? 'bg-accent-primary text-white hover:bg-accent-primary/90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {event.available ? 'Purchase Ticket' : 'Sold Out'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Purchase Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-display mb-4">Purchase Tickets</h2>
              <div className="mb-4">
                <p className="text-text-secondary mb-2">
                  Event: {events.find((e) => e.id === selectedEvent)?.name}
                </p>
                <p className="text-text-secondary mb-4">
                  Price: {events.find((e) => e.id === selectedEvent)?.price} $tabledadrian per ticket
                </p>
                <label className="block text-sm font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                />
                <div className="text-lg font-semibold mb-4">
                  Total: {events.find((e) => e.id === selectedEvent)?.price * quantity} $tabledadrian
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEvent(null);
                    setQuantity(1);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => purchaseTicket(selectedEvent)}
                  className="flex-1 bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Tickets */}
        {address && userTickets.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-display mb-4">My Tickets</h2>
            <div className="space-y-4">
              {userTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{ticket.eventName}</div>
                      <div className="text-sm text-text-secondary">
                        Ticket ID: {ticket.id}
                      </div>
                      {ticket.txHash && (
                        <div className="text-xs text-text-secondary mt-1">
                          TX: {ticket.txHash.slice(0, 10)}...
                        </div>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Confirmed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

