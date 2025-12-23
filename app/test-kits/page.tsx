'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Package,
  Beaker,
  Dna,
  Droplet,
  Microscope,
} from 'lucide-react';

export default function TestKitsPage() {
  const { address } = useAccount();
  const [testKits, setTestKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKit, setSelectedKit] = useState<any>(null);
  const [filters, setFilters] = useState({
    kitType: '',
    category: '',
    currency: 'TA',
    minPrice: '',
    maxPrice: '',
    provider: '',
  });
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    loadTestKits();
    if (address) {
      loadOrders();
    }
  }, [address, filters]);

  const loadTestKits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.kitType) params.append('kitType', filters.kitType);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.provider) params.append('provider', filters.provider);
      params.append('currency', filters.currency);

      const response = await fetch(`/api/test-kits?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setTestKits(data.testKits || []);
      }
    } catch (error) {
      console.error('Error loading test kits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!address) return;
    
    try {
      const response = await fetch(`/api/test-kits/orders?userId=${address}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleOrder = async (kit: any) => {
    if (!address) {
      alert('Please connect your wallet to order test kits');
      return;
    }

    setSelectedKit(kit);
  };

  const getKitTypeIcon = (kitType: string) => {
    switch (kitType) {
      case 'blood':
        return Droplet;
      case 'microbiome':
        return Beaker;
      case 'dna':
        return Dna;
      case 'microfluidic':
        return Microscope;
      default:
        return Package;
    }
  };

  const kitTypes = [
    { value: '', label: 'All Types' },
    { value: 'blood', label: 'Blood Tests' },
    { value: 'microbiome', label: 'Microbiome' },
    { value: 'dna', label: 'DNA Tests' },
    { value: 'microfluidic', label: 'Microfluidic' },
  ];

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'metabolic_panel', label: 'Metabolic Panel' },
    { value: 'hormone_panel', label: 'Hormone Panel' },
    { value: 'vitamin_panel', label: 'Vitamin Panel' },
    { value: 'inflammation', label: 'Inflammation' },
    { value: 'microbiome', label: 'Microbiome' },
    { value: 'genetic', label: 'Genetic' },
  ];

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Beaker className="w-8 h-8 text-accent-primary" />
          <h1 className="text-4xl font-display text-accent-primary">
            Test Kits & Diagnostics
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-text-secondary" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Kit Type Filter */}
            <select
              value={filters.kitType}
              onChange={(e) => setFilters({ ...filters, kitType: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary"
            >
              {kitTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Currency Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, currency: 'TA' })}
                className={`px-4 py-2 rounded-lg ${
                  filters.currency === 'TA'
                    ? 'bg-accent-primary text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                $tabledadrian
              </button>
              <button
                onClick={() => setFilters({ ...filters, currency: 'USD' })}
                className={`px-4 py-2 rounded-lg ${
                  filters.currency === 'USD'
                    ? 'bg-accent-primary text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                USD
              </button>
            </div>

            {/* Price Range */}
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary"
            />
          </div>
        </div>

        {/* Test Kits Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto"></div>
            <p className="mt-4 text-text-secondary">Loading test kits...</p>
          </div>
        ) : testKits.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Test Kits Found</h3>
            <p className="text-text-secondary">
              Try adjusting your filters or check back later for new test kits.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {testKits.map((kit) => {
              const Icon = getKitTypeIcon(kit.kitType);
              return (
                <div
                  key={kit.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {kit.imageUrl && (
                    <img
                      src={kit.imageUrl}
                      alt={kit.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-accent-primary" />
                      <span className="text-xs font-medium text-text-secondary uppercase">
                        {kit.kitType}
                      </span>
                    </div>
                    <h3 className="text-xl font-display text-text-primary mb-2">
                      {kit.name}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                      {kit.description}
                    </p>
                    
                    {kit.biomarkersTested && kit.biomarkersTested.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-text-secondary mb-1">
                          Tests:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {kit.biomarkersTested.slice(0, 4).map((marker: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-cream rounded text-xs text-text-primary"
                            >
                              {marker}
                            </span>
                          ))}
                          {kit.biomarkersTested.length > 4 && (
                            <span className="px-2 py-1 bg-cream rounded text-xs text-text-primary">
                              +{kit.biomarkersTested.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-display text-accent-primary">
                          {kit.price} {kit.currency === 'TA' ? '$tabledadrian' : '$'}
                        </div>
                        {kit.processingTime && (
                          <div className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {kit.processingTime} days processing
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOrder(kit)}
                      className="w-full bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Order Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Modal */}
        {selectedKit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-display mb-4">Order Test Kit</h2>
              <div className="mb-4">
                <h3 className="font-semibold">{selectedKit.name}</h3>
                <p className="text-text-secondary text-sm">{selectedKit.description}</p>
                <p className="text-xl font-bold text-accent-primary mt-2">
                  {selectedKit.price} {selectedKit.currency === 'TA' ? '$tabledadrian' : '$'}
                </p>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const shippingAddress = {
                    name: formData.get('name'),
                    street: formData.get('street'),
                    city: formData.get('city'),
                    state: formData.get('state'),
                    zip: formData.get('zip'),
                    country: formData.get('country'),
                  };

                  try {
                    const response = await fetch('/api/test-kits/order', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: address,
                        kitId: selectedKit.id,
                        quantity: 1,
                        shippingAddress,
                        paymentMethod: selectedKit.currency === 'TA' ? 'crypto' : 'fiat',
                      }),
                    });

                    const data = await response.json();
                    if (data.success) {
                      alert('Order placed successfully!');
                      setSelectedKit(null);
                      await loadOrders();
                    } else {
                      alert(data.error || 'Order failed');
                    }
                  } catch (error) {
                    console.error('Order error:', error);
                    alert('Order failed');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Address</label>
                  <input
                    name="name"
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                  />
                  <input
                    name="street"
                    placeholder="Street Address"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="city"
                      placeholder="City"
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      name="state"
                      placeholder="State"
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      name="zip"
                      placeholder="ZIP Code"
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      name="country"
                      placeholder="Country"
                      required
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setSelectedKit(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-primary/90"
                  >
                    Place Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Orders */}
        {address && orders.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-8">
            <h2 className="text-2xl font-display mb-4">My Orders</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 border border-gray-200 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">{order.kit.name}</div>
                    <div className="text-sm text-text-secondary">
                      Ordered: {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                    {order.trackingNumber && (
                      <div className="text-sm text-text-secondary">
                        Tracking: {order.trackingNumber}
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

