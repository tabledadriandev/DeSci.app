'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Camera, ShoppingCart, Package } from 'lucide-react';

export default function GroceriesPage() {
  const { address } = useAccount();
  const [groceryList, setGroceryList] = useState<any[]>([]);
  const [newItem, setNewItem] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadGroceryList();
  }, [address]);

  const loadGroceryList = async () => {
    try {
      const response = await fetch(`/api/groceries?address=${address}`);
      const data = await response.json();
      setGroceryList(data);
    } catch (error) {
      console.error('Error loading grocery list:', error);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;

    try {
      const response = await fetch('/api/groceries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          name: newItem,
          quantity: 1,
        }),
      });

      if (response.ok) {
        setNewItem('');
        await loadGroceryList();
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const scanBarcode = async () => {
    setScanning(true);
    
    // In production, would use barcode scanner library
    // For now, simulate scanning
    try {
      // Would use QuaggaJS or similar for barcode scanning
      const barcode = prompt('Enter barcode or scan:');
      if (barcode) {
        // Look up product by barcode
        const response = await fetch(`/api/foods/barcode?barcode=${barcode}`);
        const food = await response.json();
        
        if (food) {
          // Add to grocery list
          await fetch('/api/groceries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address,
              name: food.name,
              quantity: 1,
              foodId: food.id,
            }),
          });
          await loadGroceryList();
        }
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
    } finally {
      setScanning(false);
    }
  };

  const orderFromInstacart = async () => {
    // In production, would integrate with Instacart API
    const items = groceryList.map(item => item.name).join(', ');
    window.open(`https://www.instacart.com/store/search?q=${encodeURIComponent(items)}`, '_blank');
  };

  const orderFromAmazon = async () => {
    // In production, would integrate with Amazon Fresh API
    const items = groceryList.map(item => item.name).join(', ');
    window.open(`https://www.amazon.com/s?k=${encodeURIComponent(items)}`, '_blank');
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-accent-primary">
            Smart Grocery List
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={scanBarcode}
              disabled={scanning}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
            >
              {scanning ? 'Scanning...' : (
                <>
                  <Camera className="w-4 h-4 mr-2 inline" />
                  Scan Barcode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Add Item */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder="Add grocery item..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary"
            />
            <button
              onClick={addItem}
              className="px-6 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Grocery List */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-display mb-4">Your List</h2>
          {groceryList.length === 0 ? (
            <p className="text-text-secondary">No items yet. Add some groceries!</p>
          ) : (
            <ul className="space-y-2">
              {groceryList.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-accent-primary"
                    />
                    <span className="text-text-primary">{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="text-text-secondary text-sm">
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                  {item.foodId && (
                    <span className="text-xs text-green-600">✓ Verified</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* One-Click Ordering */}
        {groceryList.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-display mb-4">Order Online</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={orderFromInstacart}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent-primary transition-colors text-left"
              >
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Instacart
                </div>
                <div className="text-sm text-text-secondary">
                  Order from local stores with same-day delivery
                </div>
              </button>
              <button
                onClick={orderFromAmazon}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent-primary transition-colors text-left"
              >
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Amazon Fresh
                </div>
                <div className="text-sm text-text-secondary">
                  Fast delivery from Amazon
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

