'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Camera, Upload, Utensils, TrendingUp, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const COMMON_FOODS = [
  'Chicken Breast', 'Salmon', 'Eggs', 'Greek Yogurt', 'Oatmeal',
  'Brown Rice', 'Quinoa', 'Broccoli', 'Spinach', 'Avocado',
  'Banana', 'Apple', 'Almonds', 'Sweet Potato', 'Whole Wheat Bread',
];

export default function NutritionPage() {
  const { address } = useAccount();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealLogs, setMealLogs] = useState<any[]>([]);
  const [dailyTotals, setDailyTotals] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    mealType: 'breakfast',
    foods: [] as string[],
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    notes: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (address) {
      loadMealLogs();
      loadDailyTotals();
    }
  }, [address, selectedDate]);

  const loadMealLogs = async () => {
    try {
      const response = await fetch(`/api/health/nutrition?userId=${address}&date=${selectedDate}`);
      const data = await response.json();
      setMealLogs(data);
    } catch (error) {
      console.error('Error loading meal logs:', error);
    }
  };

  const loadDailyTotals = async () => {
    try {
      const response = await fetch(`/api/health/nutrition/totals?userId=${address}&date=${selectedDate}`);
      const data = await response.json();
      setDailyTotals(data);
    } catch (error) {
      console.error('Error loading totals:', error);
    }
  };

  const analyzeImage = async () => {
    if (!image || !address) return;
    setAnalyzing(true);

    try {
      // Simulate food recognition (in production, use TensorFlow.js or API)
      const foods = await identifyFoods(image);
      
      // Estimate nutrition from identified foods
      const nutrition = estimateNutrition(foods);
      
      setFormData({
        ...formData,
        foods: foods.map((f: any) => f.name),
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fats: nutrition.fats,
        fiber: nutrition.fiber,
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const identifyFoods = async (imageData: string): Promise<any[]> => {
    // Simulated food recognition - in production use TensorFlow.js or API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock food identification
        const mockFoods = [
          { name: 'Grilled Chicken', confidence: 0.85, portion: '150g' },
          { name: 'Brown Rice', confidence: 0.75, portion: '100g' },
          { name: 'Steamed Broccoli', confidence: 0.80, portion: '100g' },
        ];
        resolve(mockFoods);
      }, 2000);
    });
  };

  const estimateNutrition = (foods: any[]): any => {
    // Simple nutrition estimation (in production, use comprehensive food database)
    const nutritionDB: Record<string, any> = {
      'Grilled Chicken': { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
      'Brown Rice': { calories: 111, protein: 2.6, carbs: 23, fats: 0.9, fiber: 1.8 },
      'Steamed Broccoli': { calories: 35, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6 },
    };

    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
    
    foods.forEach((food) => {
      const nutrition = nutritionDB[food.name] || { calories: 100, protein: 5, carbs: 15, fats: 3, fiber: 2 };
      totals.calories += nutrition.calories;
      totals.protein += nutrition.protein;
      totals.carbs += nutrition.carbs;
      totals.fats += nutrition.fats;
      totals.fiber += nutrition.fiber;
    });

    return totals;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const response = await fetch('/api/health/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          date: selectedDate,
          imageUrl: image,
          foodsIdentified: formData.foods,
          ...formData,
        }),
      });

      if (response.ok) {
        await loadMealLogs();
        await loadDailyTotals();
        setFormData({
          mealType: 'breakfast',
          foods: [],
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          fiber: 0,
          notes: '',
        });
        setImage(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  const addFood = (food: string) => {
    if (!formData.foods.includes(food)) {
      setFormData({ ...formData, foods: [...formData.foods, food] });
    }
  };

  return (
    <MainLayout title="Nutrition Tracking">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-accent-primary">
            Nutrition Analysis
          </h1>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 flex items-center gap-2"
            >
              <Utensils className="w-5 h-5" />
              Log Meal
            </button>
          </div>
        </div>

        {/* Daily Totals */}
        {dailyTotals && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-display mb-4">Daily Nutrition Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-primary">{dailyTotals.calories || 0}</div>
                <div className="text-sm text-text-secondary">Calories</div>
                <div className="text-xs text-text-secondary mt-1">
                  Target: {dailyTotals.targets?.calories || 2000}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{dailyTotals.protein?.toFixed(1) || 0}g</div>
                <div className="text-sm text-text-secondary">Protein</div>
                <div className="text-xs text-text-secondary mt-1">
                  Target: {dailyTotals.targets?.protein || 150}g
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{dailyTotals.carbs?.toFixed(1) || 0}g</div>
                <div className="text-sm text-text-secondary">Carbs</div>
                <div className="text-xs text-text-secondary mt-1">
                  Target: {dailyTotals.targets?.carbs || 250}g
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{dailyTotals.fats?.toFixed(1) || 0}g</div>
                <div className="text-sm text-text-secondary">Fats</div>
                <div className="text-xs text-text-secondary mt-1">
                  Target: {dailyTotals.targets?.fats || 65}g
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{dailyTotals.fiber?.toFixed(1) || 0}g</div>
                <div className="text-sm text-text-secondary">Fiber</div>
                <div className="text-xs text-text-secondary mt-1">
                  Target: {dailyTotals.targets?.fiber || 30}g
                </div>
              </div>
            </div>
            
            {/* Progress Bars */}
            <div className="mt-6 space-y-3">
              {dailyTotals.targets && Object.entries(dailyTotals.targets).map(([key, target]: [string, any]) => {
                const current = dailyTotals[key] || 0;
                const percentage = Math.min(100, (current / target) * 100);
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{key}</span>
                      <span>{current.toFixed(1)} / {target} {key === 'calories' ? '' : 'g'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage >= 100 ? 'bg-green-500' :
                          percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Meal Log Form */}
        {showForm && (
          <div
            className="bg-white rounded-xl shadow-md p-6 mb-8"
          >
            <h2 className="text-2xl font-display mb-4">Log Meal</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Meal Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, mealType: type })}
                      className={`p-3 rounded-lg border-2 ${
                        formData.mealType === type
                          ? 'border-accent-primary bg-accent-primary/10'
                          : 'border-gray-200'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Photo of Meal (Optional)</label>
                {!image ? (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                          // In production, implement camera capture
                          alert('Camera capture - implement with video element');
                        } catch (error) {
                          alert('Could not access camera');
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Take Photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img src={image} alt="Meal" className="w-full max-w-md rounded-lg" />
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={analyzeImage}
                        disabled={analyzing}
                        className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 disabled:opacity-50"
                      >
                        {analyzing ? 'Analyzing...' : 'Analyze Photo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setImage(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              {/* Food Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Foods</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMON_FOODS.map((food) => (
                    <button
                      key={food}
                      type="button"
                      onClick={() => addFood(food)}
                      className={`px-3 py-1 rounded-lg border-2 text-sm ${
                        formData.foods.includes(food)
                          ? 'border-accent-primary bg-accent-primary/10'
                          : 'border-gray-200'
                      }`}
                    >
                      {food}
                    </button>
                  ))}
                </div>
                {formData.foods.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.foods.map((food) => (
                      <span
                        key={food}
                        className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-lg text-sm flex items-center gap-2"
                      >
                        {food}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, foods: formData.foods.filter(f => f !== food) })}
                          className="hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Nutrition Values */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Calories</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fats (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fats}
                    onChange={(e) => setFormData({ ...formData, fats: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fiber (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fiber}
                    onChange={(e) => setFormData({ ...formData, fiber: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90"
                >
                  Save Meal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      mealType: 'breakfast',
                      foods: [],
                      calories: 0,
                      protein: 0,
                      carbs: 0,
                      fats: 0,
                      fiber: 0,
                      notes: '',
                    });
                    setImage(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Meal Logs */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-display mb-4">Meal Logs</h2>
          {mealLogs.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              No meals logged for this date. Start tracking your nutrition!
            </div>
          ) : (
            <div className="space-y-4">
              {mealLogs.map((meal) => (
                <div key={meal.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-text-primary capitalize">
                          {meal.mealType}
                        </span>
                        <span className="text-sm text-text-secondary">
                          {new Date(meal.date).toLocaleTimeString()}
                        </span>
                      </div>
                      {meal.foods && meal.foods.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {meal.foods.map((food: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-cream/50 rounded text-sm">
                              {food}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-4 text-sm text-text-secondary">
                        <span>{meal.calories} cal</span>
                        <span>{meal.protein}g protein</span>
                        <span>{meal.carbs}g carbs</span>
                        <span>{meal.fats}g fats</span>
                        {meal.fiber > 0 && <span>{meal.fiber}g fiber</span>}
                      </div>
                      {meal.notes && (
                        <p className="text-sm text-text-secondary mt-2">{meal.notes}</p>
                      )}
                    </div>
                    {meal.imageUrl && (
                      <img
                        src={meal.imageUrl}
                        alt="Meal"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

