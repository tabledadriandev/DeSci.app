'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function MealPlansPage() {
  const { address } = useAccount();
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadMealPlans();
    }
  }, [address]);

  const loadMealPlans = async () => {
    try {
      const response = await fetch(`/api/meals/plans?address=${address}`);
      const data = await response.json();
      setMealPlans(data);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    if (!address) return;

    try {
      const response = await fetch('/api/meals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (response.ok) {
        await loadMealPlans();
        // Award reward
        await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            type: 'meal_plan_created',
            amount: 5, // 5 TA tokens
          }),
        });
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
    }
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-accent-primary">
            Meal Plans
          </h1>
          <button
            onClick={generateMealPlan}
            className="bg-accent-primary text-white px-6 py-3 rounded-lg hover:bg-accent-primary/90 transition-colors"
          >
            Generate New Plan + Earn 5 $tabledadrian
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : mealPlans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-display mb-4">No Meal Plans Yet</h2>
            <p className="text-text-secondary mb-6">
              Generate a personalized meal plan based on your health goals and dietary preferences.
            </p>
            <button
              onClick={generateMealPlan}
              className="bg-accent-primary text-white px-6 py-3 rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              Create Your First Meal Plan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {mealPlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-display text-text-primary">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className="text-text-secondary mt-2">{plan.description}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    plan.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {plan.meals?.map((meal: any) => (
                    <div
                      key={meal.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="font-semibold text-text-primary mb-2">
                        {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                      </div>
                      <div className="text-lg font-display mb-2">{meal.name}</div>
                      {meal.calories && (
                        <div className="text-sm text-text-secondary">
                          {meal.calories} cal
                          {meal.protein && ` • ${meal.protein}g protein`}
                        </div>
                      )}
                      {meal.completed && (
                        <div className="mt-2 text-green-600 text-sm">✓ Completed</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disease-Specific Guidance */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-display mb-4">Disease-Specific Guidance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">🩺</div>
              <h3 className="font-semibold mb-2">Diabetes Management</h3>
              <p className="text-sm text-text-secondary">
                Low-carb meal plans, glycemic index tracking, blood sugar monitoring
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">❤️</div>
              <h3 className="font-semibold mb-2">Heart Health</h3>
              <p className="text-sm text-text-secondary">
                Mediterranean diet, cholesterol management, blood pressure tracking
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">🌾</div>
              <h3 className="font-semibold mb-2">Allergies & Intolerances</h3>
              <p className="text-sm text-text-secondary">
                Gluten-free, dairy-free, nut-free meal plans and recipes
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">💪</div>
              <h3 className="font-semibold mb-2">Muscle Gain</h3>
              <p className="text-sm text-text-secondary">
                High-protein meal plans, macro tracking, workout nutrition
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

