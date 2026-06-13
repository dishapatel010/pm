'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, CheckCircle2, ShoppingCart, ArrowRight, RefreshCw, AlertTriangle, MapPin, Sparkles, Check, Key, LogOut } from 'lucide-react';

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
      dinner: { name: 'Quick Paneer Toast', desc: 'Lightly seasoned paneer slices on toasted bread (or with rice).', time: '10 mins', cost: 125, searchQueries: ['paneer'] }
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
    { time: '07:30 PM', task: 'Dinner Prep: Light cooking with calming music.' }
  ],
  free: [
    { time: '08:30 AM', task: 'Enjoy relaxed breakfast preparation. Mash avocado, froth almond milk.' },
    { time: '11:30 AM', task: 'Slow-cook lunch. Let spices simmer to bring out maximum gourmet flavor.' },
    { time: '01:30 PM', task: 'Indulge in a hearty weekend lunch.' },
    { time: '06:00 PM', task: 'Pre-dinner prep: Cut fresh paneer/tofu cubes, wash spinach leaves.' },
    { time: '07:30 PM', task: 'Cook gourmet dinner. A great close to a relaxing weekend.' }
  ]
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [dayProfile, setDayProfile] = useState('moderate');
  const [dietPreference, setDietPreference] = useState('balanced');
  const [budget, setBudget] = useState(400);
  const [address, setAddress] = useState<any>(null);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [mealPlan, setMealPlan] = useState<Plan | null>(null);
  const [todoList, setTodoList] = useState<Array<{ time: string; task: string }>>([]);
  const [cartDetails, setCartDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
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

  // Verify Auth Status on Load
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
        } else if (res.success && res.addresses) {
          setAddress({ name: 'Home Address', address: 'Home, Bengaluru' });
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const plan = RECIPE_INGREDIENTS[dayProfile][dietPreference];
    setMealPlan(plan);
    setTodoList(TIMELINE_CONFIGS[dayProfile]);

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
    
    setPlanGenerated(true);
    setLoading(false);
  };

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

  const handleCheckout = async () => {
    setLoading(true);
    const checkoutRes = await callMcp('checkout');
    if (checkoutRes.success) {
      setOrderResult(checkoutRes);
      setOrderModalOpen(true);
    } else {
      alert(checkoutRes.error || 'Failed to place order.');
    }
    setLoading(false);
  };

  const cartTotal = cartDetails?.billBreakdown?.grandTotal || 0;
  const isOverBudget = cartTotal > budget;
  const progressPercent = Math.min((cartTotal / budget) * 100, 100);

  // Render Swiggy Login landing screen if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-sans relative px-4">
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[420px] z-10 text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 bg-orange-500 rounded-full shadow-[0_0_20px_#f97316]" />
            <h1 className="text-3xl font-extrabold tracking-tight">
              Swiggy MCP <br />
              <span className="bg-gradient-to-r from-orange-500 to-purple-400 bg-clip-text text-transparent">Smart Planner</span>
            </h1>
            <p className="text-zinc-400 text-xs">Real-time meal planner integrating Swiggy Instamart via MCP</p>
          </div>

          <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md text-left">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-zinc-100">Sign In to Swiggy</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">Authorize this application to access your Swiggy Instamart cart and addresses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleOAuthLogin} className="w-full bg-orange-600 text-zinc-50 hover:bg-orange-500 font-bold py-4 flex items-center justify-center gap-2">
                <Key className="w-4 h-4" /> Connect Swiggy Account (OAuth)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard Interface
  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white pb-16">
      <header className="max-w-7xl mx-auto w-full px-6 py-8 border-b border-zinc-800/60 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_15px_#f97316] animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight">
            Swiggy MCP <span className="bg-gradient-to-r from-orange-500 to-purple-400 bg-clip-text text-transparent">Smart Planner</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-xs font-medium text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            Swiggy Connected
          </div>

          {address && (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-xs font-medium text-zinc-300 max-w-[200px] truncate">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="truncate">{address.name}</span>
            </div>
          )}

          <button onClick={handleLogout} className="bg-zinc-900 border border-zinc-800 hover:border-red-900 hover:text-red-400 p-2.5 rounded-full transition-colors text-zinc-400" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 mt-10 items-start z-10">
        {/* Left Form Panel */}
        <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-zinc-100">Configure Plan</CardTitle>
            <CardDescription className="text-zinc-400 text-xs">Customize meals based on schedule and budget constraints.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Day Schedule</label>
              <select
                value={dayProfile}
                onChange={(e) => setDayProfile(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none text-zinc-100 focus:border-orange-500 transition-colors"
              >
                <option value="busy">Busy (Quick 10m prep)</option>
                <option value="moderate">Moderate (Normal prep)</option>
                <option value="free">Free Weekend (Gourmet style)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Diet Preference</label>
              <select
                value={dietPreference}
                onChange={(e) => setDietPreference(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none text-zinc-100 focus:border-orange-500 transition-colors"
              >
                <option value="balanced">Balanced Diet</option>
                <option value="high-protein">High Protein</option>
                <option value="vegetarian">Vegetarian Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Daily Budget (INR)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  min={150}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none text-zinc-100 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-orange-600 text-zinc-50 hover:bg-orange-500 font-bold transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Generate Meal Plan'}
            </Button>
          </CardFooter>
        </Card>

        {/* Results Area */}
        {planGenerated && mealPlan && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Meal Plan & Todo Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Daily Meals */}
              <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-zinc-100">Daily Meals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(['breakfast', 'lunch', 'dinner'] as const).map((mealKey) => {
                    const meal = mealPlan[mealKey];
                    return (
                      <div key={mealKey} className="p-4 bg-zinc-950/40 border border-zinc-800/50 rounded-xl hover:border-orange-500/20 transition-all flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`text-[10px] font-bold uppercase ${
                            mealKey === 'breakfast' ? 'border-purple-500 text-purple-400 bg-purple-500/5' :
                            mealKey === 'lunch' ? 'border-amber-500 text-amber-400 bg-amber-500/5' :
                            'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                          }`}>
                            {mealKey}
                          </Badge>
                          <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" /> {meal.time}
                          </span>
                        </div>
                        <h4 className="font-semibold text-zinc-100 text-sm">{meal.name}</h4>
                        <p className="text-xs text-zinc-400 leading-normal">{meal.desc}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Cooking Todo */}
              <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-zinc-100">Cooking Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 border-l border-zinc-800 space-y-6">
                    {todoList.map((item, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-orange-500 border border-zinc-950 shadow-[0_0_8px_#f97316]" />
                        <span className="text-[11px] font-bold text-orange-500 block mb-0.5">{item.time}</span>
                        <p className="text-xs text-zinc-300 leading-normal">{item.task}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Swiggy Instamart Grocery Section */}
            {cartDetails && (
              <Card className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800/50 pb-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-zinc-100">Swiggy Instamart Cart</CardTitle>
                    <CardDescription className="text-zinc-400 text-xs">Ingredients synchronized via Swiggy MCP protocol</CardDescription>
                  </div>
                  <Badge className="bg-orange-500 text-zinc-950 font-black italic tracking-tighter text-sm px-3.5 py-1">
                    instamart
                  </Badge>
                </CardHeader>
                <CardContent className="py-6 space-y-6">
                  {/* Item List */}
                  <div className="divide-y divide-zinc-800/60">
                    {cartDetails.items.map((item: any) => (
                      <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <span className="font-semibold text-zinc-100 block">{item.name} (x{item.quantity})</span>
                          {item.substituteId && (
                            <span className="text-[10px] text-orange-400 font-medium flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Can replace with: {item.substituteText}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-zinc-200 text-sm">₹{item.totalCost}</span>
                      </div>
                    ))}
                  </div>

                  {/* Budget feasibility logic widget */}
                  <div className="bg-zinc-950/60 border border-zinc-800/80 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 font-medium">Cart Total: <strong className="text-zinc-200">₹{cartTotal}</strong></span>
                      <span className="text-zinc-400 font-medium">Daily Budget: <strong className="text-zinc-200">₹{budget}</strong></span>
                    </div>
                    <Progress value={progressPercent} className={`h-2 ${isOverBudget ? 'bg-red-950' : 'bg-green-950'}`} />
                    
                    <div className="flex items-center gap-2 mt-1">
                      {isOverBudget ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          <span className="text-xs text-red-400 font-semibold leading-none">
                            Budget exceeded by ₹{cartTotal - budget}! Try substitutions.
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          <span className="text-xs text-green-400 font-semibold leading-none">
                            Meal plan is fully feasible within budget.
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-4 border-t border-zinc-800/50 pt-6">
                  {isOverBudget && cartDetails.items.some((i: any) => i.substituteId) && (
                    <Button
                      onClick={handleSubstitute}
                      disabled={loading}
                      variant="outline"
                      className="flex-1 border-orange-500/30 text-orange-400 hover:bg-orange-500/10 font-bold"
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> Substitute Items
                    </Button>
                  )}
                  <Button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-zinc-50 font-bold"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" /> Place Swiggy Order
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Checkout Dialog */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-[420px]">
          <DialogHeader className="items-center text-center space-y-2">
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-1">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <DialogTitle className="text-xl font-bold">Order Placed Successfully!</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Your grocery items have been ordered via Swiggy Instamart.
            </DialogDescription>
          </DialogHeader>

          {orderResult && (
            <div className="space-y-4 my-2">
              <div className="text-center bg-zinc-950 p-2 border border-zinc-800 rounded-lg text-[11px] text-zinc-400">
                Order ID: <strong className="text-zinc-100">{orderResult.orderId}</strong>
              </div>

              <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl text-xs space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-orange-500 block tracking-wider">Delivery Details</span>
                <p className="text-zinc-300 leading-normal">{orderResult.deliveredTo || 'Home Address'}</p>
              </div>

              <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl text-xs space-y-2">
                <span className="text-[10px] uppercase font-bold text-orange-500 block tracking-wider mb-1">Bill Summary</span>
                <div className="flex justify-between text-zinc-400">
                  <span>Items Subtotal</span>
                  <span>₹{orderResult.bill.itemTotal}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Delivery & Platform Fees</span>
                  <span>₹{orderResult.bill.deliveryFee + orderResult.bill.platformFee}</span>
                </div>
                {orderResult.bill.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discounts Applied</span>
                    <span>-₹{orderResult.bill.discount}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-800 pt-2 font-bold text-green-400 text-sm">
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
                location.reload();
              }}
              className="w-full bg-orange-600 hover:bg-orange-500 font-bold"
            >
              Awesome!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
