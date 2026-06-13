'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, CheckCircle2, ShoppingCart, ArrowRight, RefreshCw, AlertTriangle, MapPin, Sparkles, Check, Key, LogOut, Info } from 'lucide-react';

interface Meal {
  name: string;
  desc: string;
  time: string;
  cost: number;
  searchQueries: string[];
}

interface Plan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

const RECIPE_INGREDIENTS: Record<string, Record<string, Plan>> = {
  busy: {
    balanced: {
      breakfast: { name: 'Quick Almond Milk Oats', desc: 'A fast, high-fiber start to the day using rolled oats, almond milk, and banana.', time: '5 mins', cost: 120, searchQueries: ['oats', 'almond milk', 'banana'] },
      lunch: { name: 'Quick Tofu Rice Bowl', desc: 'Tofu cubed and stir-fried with white rice and soy sauce.', time: '10 mins', cost: 140, searchQueries: ['tofu', 'white rice'] },
      dinner: { name: 'Quick Spinach Egg Scramble', desc: 'Scrambled eggs with fresh spinach and basic spices.', time: '10 mins', cost: 100, searchQueries: ['eggs', 'spinach'] }
    },
    'high-protein': {
      breakfast: { name: 'Protein Egg Oats', desc: 'Rolled oats cooked with egg whites for maximum protein absorption.', time: '8 mins', cost: 135, searchQueries: ['eggs', 'oats'] },
      lunch: { name: 'Quick Chicken Rice Bowl', desc: 'Chicken breast and brown rice ready in minutes.', time: '12 mins', cost: 180, searchQueries: ['chicken breast', 'brown rice'] },
      dinner: { name: 'Quick Protein Tofu Scramble', desc: 'Pan-seared high protein tofu cubes with spinach.', time: '10 mins', cost: 110, searchQueries: ['tofu', 'spinach'] }
    },
    vegetarian: {
      breakfast: { name: 'Banana Oats Bowl', desc: 'Quick rolled oats topped with sliced bananas and milk.', time: '5 mins', cost: 95, searchQueries: ['oats', 'banana', 'milk'] },
      lunch: { name: 'Quick Tofu Spinach Rice', desc: 'Tofu sautéed with spinach and served over white rice.', time: '10 mins', cost: 130, searchQueries: ['tofu', 'spinach', 'white rice'] },
      dinner: { name: 'Quick Paneer Toast', desc: 'Lightly seasoned paneer slices on toasted bread.', time: '10 mins', cost: 125, searchQueries: ['paneer'] }
    }
  },
  moderate: {
    balanced: {
      breakfast: { name: 'Spinach & Egg Omelette', desc: 'A fluffy omelette filled with organic eggs and fresh spinach.', time: '10 mins', cost: 150, searchQueries: ['eggs', 'spinach'] },
      lunch: { name: 'Paneer & Brown Rice Bowl', desc: 'Sautéed paneer with brown rice and mixed greens.', time: '20 mins', cost: 210, searchQueries: ['paneer', 'brown rice', 'spinach'] },
      dinner: { name: 'Banana Almond Milk Shake & Oats', desc: 'A wholesome meal replacement shake with oats.', time: '15 mins', cost: 160, searchQueries: ['almond milk', 'banana', 'oats'] }
    },
    'high-protein': {
      breakfast: { name: 'Classic Chicken & Eggs Breakfast', desc: 'Boiled eggs alongside lightly seasoned chicken breast.', time: '15 mins', cost: 220, searchQueries: ['chicken breast', 'eggs'] },
      lunch: { name: 'Chicken & Quinoa Salad', desc: 'High protein quinoa tossed with cooked chicken and spinach.', time: '20 mins', cost: 260, searchQueries: ['chicken breast', 'quinoa', 'spinach'] },
      dinner: { name: 'Seared Tofu & Eggs', desc: 'Crispy tofu block served with scrambled eggs.', time: '15 mins', cost: 150, searchQueries: ['tofu', 'eggs'] }
    },
    vegetarian: {
      breakfast: { name: 'Paneer Spinach Sauté', desc: 'Fresh paneer cubes sautéed with green spinach and spices.', time: '12 mins', cost: 150, searchQueries: ['paneer', 'spinach'] },
      lunch: { name: 'Tofu Quinoa Bowl', desc: 'Quinoa cooked with seasoned tofu and herbs.', time: '20 mins', cost: 200, searchQueries: ['tofu', 'quinoa'] },
      dinner: { name: 'Spinach Rice & Milk', desc: 'Home-cooked spinach rice paired with milk.', time: '15 mins', cost: 130, searchQueries: ['spinach', 'white rice', 'milk'] }
    }
  },
  free: {
    balanced: {
      breakfast: { name: 'Premium Avocado Toast & Latte', desc: 'Mashed premium avocado on toast served with almond milk latte.', time: '15 mins', cost: 380, searchQueries: ['avocado', 'almond milk', 'eggs'] },
      lunch: { name: 'Gourmet Chicken Quinoa Medley', desc: 'Seasoned chicken breast cooked slow with quinoa and fresh greens.', time: '30 mins', cost: 320, searchQueries: ['chicken breast', 'quinoa', 'spinach'] },
      dinner: { name: 'Gourmet Paneer Tikka Bowl', desc: 'Baked paneer tikka over fragrant brown rice.', time: '25 mins', cost: 210, searchQueries: ['paneer', 'brown rice'] }
    },
    'high-protein': {
      breakfast: { name: 'High Protein Avocado Toast', desc: 'Mashed avocado with organic scrambled eggs and oats.', time: '15 mins', cost: 350, searchQueries: ['avocado', 'eggs', 'oats'] },
      lunch: { name: 'Double Chicken Quinoa Pot', desc: 'Extra portions of chicken breast slow cooked with quinoa.', time: '30 mins', cost: 440, searchQueries: ['chicken breast', 'quinoa'] },
      dinner: { name: 'Tofu, Paneer & Rice Bowl', desc: 'A rich protein medley of tofu and paneer with brown rice.', time: '25 mins', cost: 280, searchQueries: ['tofu', 'paneer', 'brown rice'] }
    },
    vegetarian: {
      breakfast: { name: 'Gourmet Avocado Oats Bowl', desc: 'Creamy oats bowl topped with banana and avocado.', time: '15 mins', cost: 320, searchQueries: ['avocado', 'banana', 'oats'] },
      lunch: { name: 'Gourmet Paneer Quinoa Curry', desc: 'Rich paneer curry served with superfood quinoa.', time: '25 mins', cost: 280, searchQueries: ['paneer', 'quinoa', 'spinach'] },
      dinner: { name: 'Spiced Tofu Spinach Rice', desc: 'Slow-cooked tofu and spinach curry served with brown rice.', time: '25 mins', cost: 170, searchQueries: ['tofu', 'spinach', 'brown rice'] }
    }
  }
};

const TIMELINE_CONFIGS: Record<string, Array<{ time: string; task: string }>> = {
  busy: [
    { time: '07:30 AM', task: 'Prep 5-min oats breakfast. Low effort, keeps you energized.' },
    { time: '12:30 PM', task: 'Lunch: Quick 10-min Rice Bowl. Use single pan to minimize cleanup.' },
    { time: '08:00 PM', task: 'Dinner: 10-min Spinach Scramble. Quick wind-down meal after a long day.' }
  ],
  moderate: [
    { time: '07:30 AM', task: 'Sauté breakfast ingredients. Spend 12 mins cooking fresh.' },
    { time: '11:45 AM', task: 'Mid-day check: Ensure lunch ingredients are ready for your 20-min break.' },
    { time: '01:00 PM', task: 'Lunch: Assemble Rice Bowl. Savor home-cooked balanced diet.' },
    { time: '07:30 PM', task: 'Dinner Prep: Sauté ingredients gently.' }
  ],
  free: [
    { time: '08:30 AM', task: 'Enjoy relaxed breakfast preparation. Savor the process.' },
    { time: '11:30 AM', task: 'Slow-cook lunch. Let spices simmer to bring out maximum gourmet flavor.' },
    { time: '01:30 PM', task: 'Indulge in a hearty weekend lunch.' },
    { time: '06:00 PM', task: 'Pre-dinner prep: Cut fresh paneer/tofu cubes, wash spinach leaves.' },
    { time: '07:30 PM', task: 'Cook gourmet dinner. A great close to a relaxing weekend.' }
  ]
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'instamart' | 'food'>('instamart');
  
  // App Configs
  const [dayProfile, setDayProfile] = useState('moderate');
  const [dietPreference, setDietPreference] = useState('balanced');
  const [budget, setBudget] = useState(400);
  const [address, setAddress] = useState<any>(null);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [mealPlan, setMealPlan] = useState<Plan | null>(null);
  const [todoList, setTodoList] = useState<Array<{ time: string; task: string }>>([]);
  const [loading, setLoading] = useState(false);

  // Instamart Cart State
  const [cartDetails, setCartDetails] = useState<any>(null);

  // Food Delivery state
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [foodMenu, setFoodMenu] = useState<any[]>([]);
  const [foodCartDetails, setFoodCartDetails] = useState<any>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [trackingDetails, setTrackingDetails] = useState<any>(null);

  // Checkout Dialog Modals
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  const callMcp = async (method: string, params: any = {}) => {
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: { name: method, arguments: params },
          id: Date.now()
        })
      });
      const data = await res.json();
      return data.result || { success: false, error: 'Failed call' };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Connection error' };
    }
  };

  // Verify Auth Status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        if (data.authenticated) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkAuth();
  }, []);

  // Fetch address once logged in
  useEffect(() => {
    if (isLoggedIn) {
      const fetchAddress = async () => {
        const res = await callMcp('get_addresses');
        if (res.success && res.addresses?.length > 0) {
          setAddress(res.addresses[0]);
        } else if (res.success) {
          setAddress({ name: 'Home Address', address: 'Indiranagar, Bengaluru' });
        }
      };
      fetchAddress();
    }
  }, [isLoggedIn]);

  const handleOAuthLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  // Main Generator logic
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTrackingDetails(null);
    setAppliedCoupon(null);
    setSelectedRestaurant(null);
    
    const plan = RECIPE_INGREDIENTS[dayProfile][dietPreference];
    setMealPlan(plan);
    setTodoList(TIMELINE_CONFIGS[dayProfile]);

    if (activeTab === 'instamart') {
      const queries = Array.from(new Set([
        ...plan.breakfast.searchQueries,
        ...plan.lunch.searchQueries,
        ...plan.dinner.searchQueries
      ]));

      const cartItems: Array<{ productId: string; quantity: number }> = [];

      for (const query of queries) {
        const searchRes = await callMcp('search_products', { query });
        if (searchRes.success && searchRes.products?.length > 0) {
          cartItems.push({
            productId: searchRes.products[0].id,
            quantity: 1
          });
        }
      }

      const cartRes = await callMcp('update_cart', { items: cartItems });
      if (cartRes.success) {
        setCartDetails(cartRes.cart);
      }
    } else {
      const restRes = await callMcp('search_restaurants', { query: 'healthy' });
      if (restRes.success && restRes.restaurants?.length > 0) {
        setRestaurants(restRes.restaurants);
        const chosen = restRes.restaurants[0];
        setSelectedRestaurant(chosen);
        await selectRestaurant(chosen.id);
      }
    }
    
    setPlanGenerated(true);
    setLoading(false);
  };

  // Instamart Substitutions
  const handleSubstitute = async () => {
    if (!cartDetails) return;
    setLoading(true);

    const updatedItems = cartDetails.items.map((item: any) => {
      if (item.substituteId) {
        return { productId: item.substituteId, quantity: item.quantity };
      }
      return { productId: item.id, quantity: item.quantity };
    });

    const cartRes = await callMcp('update_cart', { items: updatedItems });
    if (cartRes.success) {
      setCartDetails(cartRes.cart);
    }
    setLoading(false);
  };

  // Food Menu Selection
  const selectRestaurant = async (restaurantId: string) => {
    const menuRes = await callMcp('get_restaurant_menu', { restaurantId });
    if (menuRes.success) {
      setFoodMenu(menuRes.items || []);
      
      const itemsToAdd = menuRes.items.slice(0, 2).map((item: any) => ({
        itemId: item.id,
        quantity: 1
      }));

      const cartRes = await callMcp('update_food_cart', { restaurantId, items: itemsToAdd });
      if (cartRes.success) {
        setFoodCartDetails(cartRes.cart);
      }

      const coupRes = await callMcp('fetch_food_coupons');
      if (coupRes.success) {
        setAvailableCoupons(coupRes.coupons || []);
      }
    }
  };

  const handleApplyCoupon = async (code: string) => {
    setLoading(true);
    const cartRes = await callMcp('apply_food_coupon', { code });
    if (cartRes.success) {
      setFoodCartDetails(cartRes.cart);
      setAppliedCoupon(code);
    }
    setLoading(false);
  };

  // Checkout flows
  const handleCheckout = async () => {
    setLoading(true);
    if (activeTab === 'instamart') {
      const checkoutRes = await callMcp('checkout');
      if (checkoutRes.success) {
        setOrderResult(checkoutRes);
        setOrderModalOpen(true);
      } else {
        alert(checkoutRes.error || 'Failed to place Instamart order.');
      }
    } else {
      const checkoutRes = await callMcp('place_food_order', { paymentMethod: 'COD' });
      if (checkoutRes.success) {
        setOrderResult(checkoutRes);
        setOrderModalOpen(true);
        const trackRes = await callMcp('track_food_order', { orderId: checkoutRes.orderId });
        if (trackRes.success) {
          setTrackingDetails(trackRes);
        }
      } else {
        alert(checkoutRes.error || 'Failed to place Food order.');
      }
    }
    setLoading(false);
  };

  const imCartTotal = cartDetails?.billBreakdown?.grandTotal || 0;
  const imIsOverBudget = imCartTotal > budget;
  const imProgressPercent = Math.min((imCartTotal / budget) * 100, 100);

  const foodCartTotal = foodCartDetails?.billBreakdown?.grandTotal || 0;
  const foodIsOverBudget = foodCartTotal > budget;
  const foodProgressPercent = Math.min((foodCartTotal / budget) * 100, 100);

  // Landing view (Not logged in)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-[#F0EBDA] text-[#1E2016] flex flex-col items-center justify-center font-serif relative px-4">
        <div className="w-full max-w-[420px] text-center space-y-8">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl font-display font-light tracking-tight">
              Swiggy MCP <br />
              <span className="text-[#B0361B] italic font-semibold">Tea House Planner</span>
            </h1>
            <p className="font-sans-jp tracking-[0.2em] uppercase text-[0.72rem] text-[#7B8069]">
              Standardized Culinary Management
            </p>
          </div>

          <Card className="bg-[#F8F3E1] border border-[#7B8069] rounded-lg shadow-none text-left p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-display text-[#1E2016]">Connect Swiggy Account</CardTitle>
              <CardDescription className="text-[#7B8069] text-xs font-serif mt-1">
                Authorize this application to access your Swiggy Instamart and Food delivery APIs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* PRIMARY ACTION BUTTON IN CLAY RED */}
              <Button onClick={handleOAuthLogin} className="w-full bg-[#B0361B] text-[#F8F3E1] hover:bg-[#962d16] font-sans-jp tracking-[0.1em] font-bold py-3 flex items-center justify-center gap-2 rounded-md">
                <Key className="w-4 h-4" /> Connect Swiggy Account (OAuth)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard Interface (Logged In)
  return (
    <div className="min-h-screen w-full bg-[#F0EBDA] text-[#1E2016] flex flex-col font-serif pb-16">
      <header className="max-w-7xl mx-auto w-full px-6 py-8 border-b border-[#7B8069]/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-light">
            Swiggy MCP <span className="text-[#B0361B] italic">Tea House Planner</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Vertical Toggle */}
          <div className="bg-[#F8F3E1] p-1 border border-[#7B8069] rounded-md flex text-xs gap-1">
            <button
              onClick={() => { setActiveTab('instamart'); setPlanGenerated(false); }}
              className={`px-4 py-1.5 rounded-sm transition-all font-sans-jp tracking-[0.1em] uppercase text-[10px] ${activeTab === 'instamart' ? 'bg-[#1E2016] text-[#F8F3E1] font-bold' : 'text-[#7B8069] hover:text-[#1E2016]'}`}
            >
              Grocery Delivery
            </button>
            <button
              onClick={() => { setActiveTab('food'); setPlanGenerated(false); }}
              className={`px-4 py-1.5 rounded-sm transition-all font-sans-jp tracking-[0.1em] uppercase text-[10px] ${activeTab === 'food' ? 'bg-[#1E2016] text-[#F8F3E1] font-bold' : 'text-[#7B8069] hover:text-[#1E2016]'}`}
            >
              Food Delivery
            </button>
          </div>

          {address && (
            <div className="flex items-center gap-2 bg-[#F8F3E1] border border-[#7B8069] px-4 py-2 rounded-md text-xs text-[#1E2016] max-w-[200px] truncate">
              <MapPin className="w-3.5 h-3.5 text-[#B0361B] shrink-0" />
              <span className="truncate">{address.name}</span>
            </div>
          )}

          <button onClick={handleLogout} className="bg-[#F8F3E1] border border-[#7B8069] hover:border-[#B0361B] hover:text-[#B0361B] p-2 rounded-md transition-colors text-[#7B8069]" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 mt-10 items-start">
        {/* Left Form Panel */}
        <Card className="bg-[#F8F3E1] border border-[#7B8069] rounded-lg shadow-none p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-display text-[#1E2016]">Configure Plan</CardTitle>
            <CardDescription className="text-[#7B8069] text-xs font-serif mt-1">
              {activeTab === 'instamart' ? 'Source fresh ingredients via Instamart.' : 'Order pre-cooked meals via Food Delivery.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-1.5">
              <label className="font-sans-jp tracking-[0.2em] uppercase text-[10px] text-[#7B8069]">Day Schedule</label>
              <select
                value={dayProfile}
                onChange={(e) => setDayProfile(e.target.value)}
                className="w-full bg-[#F0EBDA] border border-[#7B8069] rounded-md px-3 py-2 text-sm outline-none text-[#1E2016] focus:border-[#B0361B] transition-colors font-serif"
              >
                <option value="busy">Busy (Quick meals)</option>
                <option value="moderate">Moderate (Standard prep)</option>
                <option value="free">Free Weekend (Relaxed gourmet)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans-jp tracking-[0.2em] uppercase text-[10px] text-[#7B8069]">Diet Preference</label>
              <select
                value={dietPreference}
                onChange={(e) => setDietPreference(e.target.value)}
                className="w-full bg-[#F0EBDA] border border-[#7B8069] rounded-md px-3 py-2 text-sm outline-none text-[#1E2016] focus:border-[#B0361B] transition-colors font-serif"
              >
                <option value="balanced">Balanced Diet</option>
                <option value="high-protein">High Protein</option>
                <option value="vegetarian">Vegetarian Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans-jp tracking-[0.2em] uppercase text-[10px] text-[#7B8069]">Daily Budget (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8069] text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  min={150}
                  className="w-full bg-[#F0EBDA] border border-[#7B8069] rounded-md pl-7 pr-3 py-2 text-sm outline-none text-[#1E2016] focus:border-[#B0361B] transition-colors font-serif"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-0 mt-6">
            {/* If plan is NOT generated yet, this is the sole Tertiary action button */}
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full text-[#F8F3E1] font-sans-jp tracking-[0.1em] font-bold py-2.5 rounded-md transition-all ${
                !planGenerated ? 'bg-[#B0361B] hover:bg-[#962d16]' : 'bg-[#7B8069] hover:bg-[#1E2016]'
              }`}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Generate Plan'}
            </Button>
          </CardFooter>
        </Card>

        {/* Results Area */}
        {planGenerated && mealPlan && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Meal Plan & Todo Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Daily Meals */}
              <Card className="bg-[#F8F3E1] border border-[#7B8069] rounded-lg shadow-none p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-display text-[#1E2016]">Daily Meals</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {(['breakfast', 'lunch', 'dinner'] as const).map((mealKey) => {
                    const meal = mealPlan[mealKey];
                    return (
                      <div key={mealKey} className="p-4 bg-[#F0EBDA]/50 border border-[#7B8069]/30 rounded-md flex flex-col gap-1">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className={`text-[9px] font-sans-jp tracking-wider uppercase border-[#7B8069] text-[#7B8069] bg-transparent`}>
                            {mealKey}
                          </Badge>
                          <span className="text-[11px] text-[#7B8069] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {meal.time}
                          </span>
                        </div>
                        <h4 className="font-semibold text-[#1E2016] text-sm font-serif">{meal.name}</h4>
                        <p className="text-xs text-[#7B8069] leading-relaxed font-serif">{meal.desc}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Cooking Todo */}
              <Card className="bg-[#F8F3E1] border border-[#7B8069] rounded-lg shadow-none p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-display text-[#1E2016]">Cooking Timeline</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative pl-6 border-l border-[#7B8069]/50 space-y-6">
                    {todoList.map((item, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[31px] top-1 w-2 h-2 rounded-full bg-[#B0361B]" />
                        <span className="font-sans-jp tracking-[0.1em] uppercase text-[10px] text-[#B0361B] block mb-0.5">{item.time}</span>
                        <p className="text-xs text-[#1E2016] leading-relaxed font-serif">{item.task}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vertical Content: Groceries vs Food Delivery */}
            {activeTab === 'instamart' ? (
              /* INSTAMART SECTION */
              cartDetails && (
                <Card className="bg-[#F8F3E1] border border-[#7B8069] rounded-lg shadow-none p-6">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-[#7B8069]/40 pb-4 p-0 mb-4">
                    <div>
                      <CardTitle className="text-lg font-display text-[#1E2016]">Swiggy Instamart Cart</CardTitle>
                      <CardDescription className="text-[#7B8069] text-xs font-serif mt-1">Ingredients synchronized via Swiggy MCP protocol</CardDescription>
                    </div>
                    <Badge className="bg-[#1E2016] text-[#F8F3E1] font-sans-jp tracking-wider uppercase text-[10px] px-3 py-1 rounded-sm">
                      instamart
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    <div className="divide-y divide-[#7B8069]/20">
                      {cartDetails.items.map((item: any) => (
                        <div key={item.id} className="py-3 flex items-center justify-between text-xs font-serif">
                          <div className="space-y-1">
                            <span className="font-semibold text-[#1E2016] block">{item.name} (x{item.quantity})</span>
                            {item.substituteId && (
                              <span className="text-[10px] text-[#B0361B] font-sans-jp tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Can replace with: {item.substituteText}
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-[#1E2016] text-sm">₹{item.totalCost}</span>
                        </div>
                      ))}
                    </div>

                    {/* Budget Widget */}
                    <div className="bg-[#F0EBDA]/60 border border-[#7B8069]/50 p-4 rounded-md space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#7B8069]">Cart Total: <strong className="text-[#1E2016]">₹{imCartTotal}</strong></span>
                        <span className="text-[#7B8069]">Daily Budget: <strong className="text-[#1E2016]">₹{budget}</strong></span>
                      </div>
                      <Progress value={imProgressPercent} className="h-1 bg-[#F0EBDA]" />
                      
                      <div className="flex items-center gap-2 mt-1">
                        {imIsOverBudget ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-[#B0361B] shrink-0" />
                            <span className="text-xs text-[#B0361B] font-semibold leading-none">
                              Budget exceeded by ₹{imCartTotal - budget}! Try substitutions.
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-[#7B8069] shrink-0" />
                            <span className="text-xs text-[#7B8069] font-semibold leading-none">
                              Meal plan is fully feasible within budget.
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-4 border-t border-[#7B8069]/40 pt-6 p-0 mt-6">
                    {imIsOverBudget && cartDetails.items.some((i: any) => i.substituteId) && (
                      <Button
                        onClick={handleSubstitute}
                        disabled={loading}
                        variant="outline"
                        className="flex-1 border-[#7B8069] text-[#1E2016] hover:bg-[#F0EBDA] font-sans-jp tracking-wider rounded-md text-xs py-2"
                      >
                        <Sparkles className="w-4 h-4 mr-2" /> Substitute Items
                      </Button>
                    )}
                    {/* PRIMARY DRIVER BUTTON IN CLAY RED */}
                    <Button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="flex-1 bg-[#B0361B] hover:bg-[#962d16] text-[#F8F3E1] font-sans-jp tracking-wider font-bold rounded-md py-2 text-xs"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> Place Instamart Order
                    </Button>
                  </CardFooter>
                </Card>
              )
            ) : (
              /* FOOD DELIVERY SECTION */
              foodCartDetails && (
                <Card className="bg-[#F8F3E1] border border-[#7B8069] rounded-lg shadow-none p-6">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-[#7B8069]/40 pb-4 p-0 mb-4">
                    <div>
                      <CardTitle className="text-lg font-display text-[#1E2016]">Swiggy Food Order (COD Only)</CardTitle>
                      <CardDescription className="text-[#7B8069] text-xs font-serif mt-1">
                        Ordering meals from <strong className="text-[#1E2016]">{selectedRestaurant?.name || 'Selected Restaurant'}</strong>
                      </CardDescription>
                    </div>
                    <Badge className="bg-[#1E2016] text-[#F8F3E1] font-sans-jp tracking-wider uppercase text-[10px] px-3 py-1 rounded-sm">
                      food
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0 space-y-6">
                    {/* Restaurant list */}
                    <div className="flex gap-4 items-center justify-between bg-[#F0EBDA]/45 p-4 rounded-md border border-[#7B8069]/30">
                      <div className="space-y-1.5 w-full">
                        <span className="text-[10px] uppercase font-sans-jp tracking-wider text-[#7B8069] font-semibold block">Restaurant Catalog</span>
                        <div className="flex gap-2 items-center flex-wrap">
                          {restaurants.map(r => (
                            <button
                              key={r.id}
                              onClick={() => { setSelectedRestaurant(r); selectRestaurant(r.id); }}
                              className={`text-xs px-3 py-1.5 rounded-md border transition-all ${selectedRestaurant?.id === r.id ? 'bg-[#B0361B]/10 border-[#B0361B] text-[#B0361B] font-bold' : 'border-[#7B8069]/40 text-[#7B8069]'}`}
                            >
                              {r.name} ({r.rating}★)
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Food Items list */}
                    <div className="divide-y divide-[#7B8069]/20">
                      {foodCartDetails.items.map((item: any) => (
                        <div key={item.id} className="py-3 flex items-center justify-between text-xs font-serif">
                          <div>
                            <span className="font-semibold text-[#1E2016] block">{item.name} (x{item.quantity})</span>
                          </div>
                          <span className="font-bold text-[#1E2016] text-sm">₹{item.totalCost}</span>
                        </div>
                      ))}
                    </div>

                    {/* Coupons and offers */}
                    {availableCoupons.length > 0 && (
                      <div className="bg-[#F0EBDA]/40 p-4 rounded-md border border-[#7B8069]/30 space-y-2.5">
                        <span className="text-[10px] uppercase font-sans-jp tracking-wider text-[#B0361B] block">Available Coupons</span>
                        {availableCoupons.map(coupon => (
                          <div key={coupon.code} className="flex justify-between items-center text-xs">
                            <div>
                              <Badge className="bg-transparent border border-[#B0361B] text-[#B0361B] font-bold text-[10px] px-2 py-0.5 rounded-sm">
                                {coupon.code}
                              </Badge>
                              <span className="text-[11px] text-[#7B8069] ml-2">{coupon.description}</span>
                            </div>
                            <Button
                              onClick={() => handleApplyCoupon(coupon.code)}
                              disabled={appliedCoupon === coupon.code}
                              size="sm"
                              variant="outline"
                              className="h-7 border-[#7B8069] text-xs px-3 rounded-md"
                            >
                              {appliedCoupon === coupon.code ? 'Applied' : 'Apply'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Budget Widget */}
                    <div className="bg-[#F0EBDA]/60 border border-[#7B8069]/50 p-4 rounded-md space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#7B8069]">Cart Total: <strong className="text-[#1E2016]">₹{foodCartTotal}</strong></span>
                        <span className="text-[#7B8069]">Daily Budget: <strong className="text-[#1E2016]">₹{budget}</strong></span>
                      </div>
                      <Progress value={foodProgressPercent} className="h-1 bg-[#F0EBDA]" />
                      
                      <div className="flex items-center gap-2 mt-1">
                        {foodIsOverBudget ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-[#B0361B] shrink-0" />
                            <span className="text-xs text-[#B0361B] font-semibold leading-none">
                              Cart exceeds target daily budget by ₹{foodCartTotal - budget}!
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-[#7B8069] shrink-0" />
                            <span className="text-xs text-[#7B8069] font-semibold leading-none">
                              Food order fits your daily budget constraints.
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-4 border-t border-[#7B8069]/40 pt-6 p-0 mt-6">
                    {/* PRIMARY ACTION DRIVER IN CLAY RED */}
                    <Button
                      onClick={handleCheckout}
                      disabled={loading || foodCartTotal > 1000}
                      className="w-full bg-[#B0361B] hover:bg-[#962d16] text-[#F8F3E1] font-sans-jp tracking-wider font-bold rounded-md py-3 text-xs"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> Order Cooked Meals (COD)
                    </Button>
                    {foodCartTotal > 1000 && (
                      <span className="text-[10px] text-[#B0361B] flex items-center gap-1 font-serif">
                        <Info className="w-3 h-3" /> Swiggy v1 cap: Orders must not exceed ₹1000.
                      </span>
                    )}

                    {/* Rider tracking */}
                    {trackingDetails && (
                      <div className="w-full bg-[#B0361B]/5 border border-[#B0361B]/30 p-4 rounded-md mt-2 flex items-center justify-between text-xs font-serif">
                        <div className="space-y-1">
                          <span className="text-[#B0361B] font-bold">Delivery Status: {trackingDetails.status}</span>
                          <p className="text-[#7B8069] text-[11px]">Rider {trackingDetails.deliveryPartner} is on the way.</p>
                        </div>
                        <span className="font-extrabold text-[#B0361B]">{trackingDetails.eta}</span>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              )
            )}
          </div>
        )}
      </main>

      {/* Checkout Dialog */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="bg-[#F8F3E1] border border-[#7B8069] text-[#1E2016] max-w-[420px]">
          <DialogHeader className="items-center text-center space-y-2">
            <div className="w-12 h-12 bg-[#B0361B]/10 text-[#B0361B] rounded-full flex items-center justify-center mb-1">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <DialogTitle className="text-xl font-display">Order Placed Successfully!</DialogTitle>
            <DialogDescription className="text-[#7B8069] text-xs font-serif">
              Your order has been placed via Swiggy {activeTab === 'instamart' ? 'Instamart' : 'Food Delivery'}.
            </DialogDescription>
          </DialogHeader>

          {orderResult && (
            <div className="space-y-4 my-2 text-left">
              <div className="text-center bg-[#F0EBDA] p-2 border border-[#7B8069]/40 rounded-md text-[11px] text-[#7B8069]">
                Order ID: <strong className="text-[#1E2016]">{orderResult.orderId}</strong>
              </div>

              <div className="bg-[#F0EBDA]/40 border border-[#7B8069]/45 p-4 rounded-md text-xs space-y-2">
                <span className="text-[10px] uppercase font-sans-jp tracking-wider text-[#B0361B] block">Delivery Details</span>
                <p className="text-[#1E2016] leading-relaxed font-serif">{orderResult.deliveredTo || 'Home Address'}</p>
              </div>

              <div className="bg-[#F0EBDA]/40 border border-[#7B8069]/45 p-4 rounded-md text-xs space-y-2">
                <span className="text-[10px] uppercase font-sans-jp tracking-wider text-[#B0361B] block mb-1">Bill Summary</span>
                <div className="flex justify-between text-[#7B8069] font-serif">
                  <span>Items Subtotal</span>
                  <span>₹{orderResult.bill.itemTotal}</span>
                </div>
                <div className="flex justify-between text-[#7B8069] font-serif">
                  <span>Delivery & Platform Fees</span>
                  <span>₹{orderResult.bill.deliveryFee + orderResult.bill.platformFee}</span>
                </div>
                {orderResult.bill.discount > 0 && (
                  <div className="flex justify-between text-[#B0361B] font-serif">
                    <span>Discounts Applied</span>
                    <span>-₹{orderResult.bill.discount}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#7B8069]/40 pt-2 font-bold text-[#B0361B] text-sm">
                  <span>Grand Total Paid</span>
                  <span>₹{orderResult.bill.grandTotal}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setOrderModalOpen(false);
                if (activeTab === 'instamart') {
                  location.reload();
                }
              }}
              className="w-full bg-[#B0361B] hover:bg-[#962d16] text-[#F8F3E1] font-sans-jp tracking-wider font-bold rounded-md py-2"
            >
              {activeTab === 'instamart' ? 'Awesome!' : 'Track Delivery'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
