'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, CheckCircle2, ShoppingCart, ArrowRight, RefreshCw, AlertTriangle, MapPin, Sparkles, Check, Key, LogOut, Send, Bot, User, CheckSquare } from 'lucide-react';

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

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  planData?: {
    dayProfile: string;
    dietPreference: string;
    budget: number;
    mealPlan: Plan;
    todoList: Array<{ time: string; task: string; completed?: boolean }>;
    cartDetails: any;
    activeTab: 'instamart' | 'food';
    restaurants: any[];
    selectedRestaurant: any;
    foodMenu: any[];
    foodCartDetails: any;
    availableCoupons: any[];
    appliedCoupon: string | null;
    trackingDetails: any;
  };
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
  const [address, setAddress] = useState<any>(null);
  
  // Chat flow state
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Checkout Dialog Modals
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [activeTabGlobal, setActiveTabGlobal] = useState<'instamart' | 'food'>('instamart');

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          // Initial greeting
          setMessages([
            {
              id: 'init',
              sender: 'assistant',
              text: "Hello! I am your Noto-inspired Tea House culinary planner, **PromptRecipe**. Tell me about your day, diet preference, and budget (e.g. 'I am busy and need vegetarian high-protein meals within ₹300'), and I'll generate a custom cooking schedule, meal plan, and Instamart cart!"
            }
          ]);
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

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOAuthLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  // Parse prompt text to extract config profile variables
  const parsePrompt = (text: string) => {
    const lower = text.toLowerCase();
    
    let day = 'moderate';
    if (lower.includes('busy') || lower.includes('quick') || lower.includes('fast') || lower.includes('short')) {
      day = 'busy';
    } else if (lower.includes('free') || lower.includes('weekend') || lower.includes('gourmet') || lower.includes('relax')) {
      day = 'free';
    }

    let diet = 'balanced';
    if (lower.includes('protein') || lower.includes('meat') || lower.includes('chicken')) {
      diet = 'high-protein';
    } else if (lower.includes('veg') || lower.includes('tofu') || lower.includes('paneer')) {
      diet = 'vegetarian';
    }

    let extractedBudget = 400;
    const match = lower.match(/(?:₹|rs\.?|inr|budget|within|under)?\s*(\d{3,4})/);
    if (match) {
      extractedBudget = parseInt(match[1]);
    }

    return { day, diet, budget: extractedBudget };
  };

  // Main Prompt handler
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const { day, diet, budget: currentBudget } = parsePrompt(textToSend);
    const plan = RECIPE_INGREDIENTS[day][diet];
    const todo = TIMELINE_CONFIGS[day].map(t => ({ ...t, completed: false }));

    let cartData = null;
    let restaurantList: any[] = [];
    let selectedRest: any = null;
    let menuList: any[] = [];
    let foodCart: any = null;
    let coupons: any[] = [];

    if (activeTabGlobal === 'instamart') {
      // Instamart Flow
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
        cartData = cartRes.cart;
      }
    } else {
      // Food Flow
      const restRes = await callMcp('search_restaurants', { query: 'healthy' });
      if (restRes.success && restRes.restaurants?.length > 0) {
        restaurantList = restRes.restaurants;
        selectedRest = restRes.restaurants[0];
        
        const menuRes = await callMcp('get_restaurant_menu', { restaurantId: selectedRest.id });
        if (menuRes.success) {
          menuList = menuRes.items || [];
          const itemsToAdd = menuList.slice(0, 2).map((item: any) => ({
            itemId: item.id,
            quantity: 1
          }));

          const cartRes = await callMcp('update_food_cart', { restaurantId: selectedRest.id, items: itemsToAdd });
          if (cartRes.success) {
            foodCart = cartRes.cart;
          }

          const coupRes = await callMcp('fetch_food_coupons');
          if (coupRes.success) {
            coupons = coupRes.coupons || [];
          }
        }
      }
    }

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: `Based on your request, I have generated a personalized plan for your **${day}** day following a **${diet}** diet constraints within a target budget of **₹${currentBudget}**:`,
      planData: {
        dayProfile: day,
        dietPreference: diet,
        budget: currentBudget,
        mealPlan: plan,
        todoList: todo,
        cartDetails: cartData,
        activeTab: activeTabGlobal,
        restaurants: restaurantList,
        selectedRestaurant: selectedRest,
        foodMenu: menuList,
        foodCartDetails: foodCart,
        availableCoupons: coupons,
        appliedCoupon: null,
        trackingDetails: null
      }
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const handleCheckboxToggle = (msgId: string, todoIndex: number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId && msg.planData) {
        const updatedTodo = [...msg.planData.todoList];
        updatedTodo[todoIndex] = {
          ...updatedTodo[todoIndex],
          completed: !updatedTodo[todoIndex].completed
        };
        return {
          ...msg,
          planData: {
            ...msg.planData,
            todoList: updatedTodo
          }
        };
      }
      return msg;
    }));
  };

  const handleSubstituteItem = async (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg || !msg.planData || !msg.planData.cartDetails) return;
    setLoading(true);

    const updatedItems = msg.planData.cartDetails.items.map((item: any) => {
      if (item.substituteId) {
        return { productId: item.substituteId, quantity: item.quantity };
      }
      return { productId: item.id, quantity: item.quantity };
    });

    const cartRes = await callMcp('update_cart', { items: updatedItems });
    if (cartRes.success) {
      setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.planData) {
          return {
            ...m,
            planData: {
              ...m.planData,
              cartDetails: cartRes.cart
            }
          };
        }
        return m;
      }));
    }
    setLoading(false);
  };

  const handleApplyCouponCode = async (msgId: string, code: string) => {
    setLoading(true);
    const cartRes = await callMcp('apply_food_coupon', { code });
    if (cartRes.success) {
      setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.planData) {
          return {
            ...m,
            planData: {
              ...m.planData,
              foodCartDetails: cartRes.cart,
              appliedCoupon: code
            }
          };
        }
        return m;
      }));
    }
    setLoading(false);
  };

  const handleOrderCheckout = async (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg || !msg.planData) return;
    setLoading(true);

    if (msg.planData.activeTab === 'instamart') {
      const checkoutRes = await callMcp('checkout');
      if (checkoutRes.success) {
        setOrderResult(checkoutRes);
        setOrderModalOpen(true);
      } else {
        alert(checkoutRes.error || 'Failed to place order.');
      }
    } else {
      const checkoutRes = await callMcp('place_food_order', { paymentMethod: 'COD' });
      if (checkoutRes.success) {
        setOrderResult(checkoutRes);
        setOrderModalOpen(true);
        const trackRes = await callMcp('track_food_order', { orderId: checkoutRes.orderId });
        if (trackRes.success) {
          setMessages(prev => prev.map(m => {
            if (m.id === msgId && m.planData) {
              return {
                ...m,
                planData: {
                  ...m.planData,
                  trackingDetails: trackRes
                }
              };
            }
            return m;
          }));
        }
      } else {
        alert(checkoutRes.error || 'Failed to place order.');
      }
    }
    setLoading(false);
  };

  const selectRestFromList = async (msgId: string, restaurant: any) => {
    setLoading(true);
    const menuRes = await callMcp('get_restaurant_menu', { restaurantId: restaurant.id });
    if (menuRes.success) {
      const itemsToAdd = (menuRes.items || []).slice(0, 2).map((item: any) => ({
        itemId: item.id,
        quantity: 1
      }));

      const cartRes = await callMcp('update_food_cart', { restaurantId: restaurant.id, items: itemsToAdd });
      if (cartRes.success) {
        setMessages(prev => prev.map(m => {
          if (m.id === msgId && m.planData) {
            return {
              ...m,
              planData: {
                ...m.planData,
                selectedRestaurant: restaurant,
                foodMenu: menuRes.items || [],
                foodCartDetails: cartRes.cart,
                appliedCoupon: null
              }
            };
          }
          return m;
        }));
      }
    }
    setLoading(false);
  };

  // Splash view if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-[#F0EBDA] text-[#1E2016] flex flex-col items-center justify-center font-serif relative px-4">
        <div className="w-full max-w-[420px] text-center space-y-8">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl font-display font-light tracking-tight">
              <span className="text-[#B0361B] italic font-semibold">PromptRecipe</span>
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
              <Button onClick={handleOAuthLogin} className="w-full bg-[#B0361B] text-[#F8F3E1] hover:bg-[#962d16] font-sans-jp tracking-[0.1em] font-bold py-3 flex items-center justify-center gap-2 rounded-md">
                <Key className="w-4 h-4" /> Connect Swiggy Account (OAuth)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F0EBDA] text-[#1E2016] flex flex-col font-serif pb-16">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 border-b border-[#7B8069]/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-light">
            <span className="text-[#B0361B] italic">PromptRecipe</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-[#F8F3E1] p-1 border border-[#7B8069] rounded-md flex text-xs gap-1">
            <button
              onClick={() => setActiveTabGlobal('instamart')}
              className={`px-4 py-1 rounded-sm transition-all font-sans-jp tracking-[0.1em] uppercase text-[9px] ${activeTabGlobal === 'instamart' ? 'bg-[#1E2016] text-[#F8F3E1] font-bold' : 'text-[#7B8069] hover:text-[#1E2016]'}`}
            >
              Grocery Delivery
            </button>
            <button
              onClick={() => setActiveTabGlobal('food')}
              className={`px-4 py-1 rounded-sm transition-all font-sans-jp tracking-[0.1em] uppercase text-[9px] ${activeTabGlobal === 'food' ? 'bg-[#1E2016] text-[#F8F3E1] font-bold' : 'text-[#7B8069] hover:text-[#1E2016]'}`}
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

      {/* Main Chat Interface */}
      <main className="max-w-4xl mx-auto w-full px-6 flex flex-col flex-1 mt-8 min-h-[500px]">
        {/* Dialogue Log */}
        <div className="flex-1 space-y-6 overflow-y-auto max-h-[650px] pr-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Bot Icon */}
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#1E2016] text-[#F8F3E1] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Box */}
              <div className={`max-w-[85%] rounded-lg p-4 font-serif text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-[#1E2016] text-[#F8F3E1]' 
                  : 'bg-[#F8F3E1] border border-[#7B8069] text-[#1E2016]'
              }`}>
                {/* Text Content */}
                <div className="prose prose-sm dark:prose-invert">
                  {msg.text}
                </div>

                {/* Plan data card overlay */}
                {msg.planData && (
                  <div className="mt-4 space-y-6 pt-4 border-t border-[#7B8069]/30">
                    
                    {/* Meals Card Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(['breakfast', 'lunch', 'dinner'] as const).map((mealKey) => {
                        const meal = msg.planData!.mealPlan[mealKey];
                        return (
                          <div key={mealKey} className="p-3 bg-[#F0EBDA]/55 border border-[#7B8069]/20 rounded-md">
                            <span className="font-sans-jp tracking-wider uppercase text-[8px] border border-[#7B8069] px-1 rounded-sm text-[#7B8069]">{mealKey}</span>
                            <h5 className="font-bold text-xs mt-1.5">{meal.name}</h5>
                            <p className="text-[11px] text-[#7B8069] mt-0.5 leading-relaxed">{meal.desc}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Timeline with Active Checkbox */}
                    <div className="p-4 bg-[#F0EBDA]/45 border border-[#7B8069]/30 rounded-md">
                      <span className="font-sans-jp tracking-wider text-[9px] uppercase text-[#7B8069] font-bold block mb-3">Cooking Checklist Timeline</span>
                      <div className="space-y-3">
                        {msg.planData.todoList.map((item, index) => (
                          <div key={index} className="flex gap-3 items-start">
                            <button 
                              onClick={() => handleCheckboxToggle(msg.id, index)}
                              className="w-4 h-4 mt-0.5 rounded border border-[#7B8069] flex items-center justify-center text-[#B0361B] hover:bg-[#F0EBDA]/50 transition-all shrink-0"
                            >
                              {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>
                            <div className="text-xs">
                              <span className="font-sans-jp font-bold text-[9px] text-[#B0361B] uppercase tracking-wider block">{item.time}</span>
                              <span className={`text-[#1E2016] ${item.completed ? 'line-through text-[#7B8069]' : ''}`}>{item.task}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Groceries tab logic (Instamart) */}
                    {msg.planData.activeTab === 'instamart' && msg.planData.cartDetails && (
                      <div className="space-y-4">
                        <span className="font-sans-jp tracking-wider text-[9px] uppercase text-[#7B8069] font-bold block">Instamart Shopping List</span>
                        <div className="divide-y divide-[#7B8069]/20">
                          {msg.planData.cartDetails.items.map((item: any) => (
                            <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-semibold">{item.name} (x{item.quantity})</span>
                                {item.substituteId && (
                                  <span className="text-[9px] text-[#B0361B] font-sans-jp tracking-wider block mt-0.5">💡 Alternative: {item.substituteText}</span>
                                )}
                              </div>
                              <span className="font-bold">₹{item.totalCost}</span>
                            </div>
                          ))}
                        </div>

                        {/* Budget Progress bar */}
                        <div className="bg-[#F0EBDA]/60 p-3 rounded-md border border-[#7B8069]/40 space-y-2">
                          <div className="flex justify-between text-[11px] text-[#7B8069]">
                            <span>Cart Total: <strong>₹{msg.planData.cartDetails.billBreakdown.grandTotal}</strong></span>
                            <span>Limit: <strong>₹{msg.planData.budget}</strong></span>
                          </div>
                          <Progress value={Math.min((msg.planData.cartDetails.billBreakdown.grandTotal / msg.planData.budget) * 100, 100)} className="h-1 bg-[#F0EBDA]" />
                          {msg.planData.cartDetails.billBreakdown.grandTotal > msg.planData.budget ? (
                            <span className="text-[10px] text-[#B0361B] font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Exceeds budget by ₹{msg.planData.cartDetails.billBreakdown.grandTotal - msg.planData.budget}.
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#7B8069] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#7B8069] shrink-0" /> FEASIBLE within daily budget.
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          {msg.planData.cartDetails.billBreakdown.grandTotal > msg.planData.budget && msg.planData.cartDetails.items.some((i: any) => i.substituteId) && (
                            <Button
                              onClick={() => handleSubstituteItem(msg.id)}
                              disabled={loading}
                              variant="outline"
                              className="flex-1 border-[#7B8069] text-xs h-9 font-sans-jp tracking-wider"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Auto-Substitute
                            </Button>
                          )}
                          {/* PRIMARY DRIVER IN CLAY RED */}
                          <Button
                            onClick={() => handleOrderCheckout(msg.id)}
                            disabled={loading}
                            className="flex-1 bg-[#B0361B] hover:bg-[#962d16] text-[#F8F3E1] font-sans-jp tracking-wider text-xs h-9"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Order via Instamart
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Cooked meals tab logic (Food) */}
                    {msg.planData.activeTab === 'food' && msg.planData.foodCartDetails && (
                      <div className="space-y-4">
                        <span className="font-sans-jp tracking-wider text-[9px] uppercase text-[#7B8069] font-bold block">Food Delivery Details</span>
                        <div className="flex gap-2 flex-wrap pb-2 border-b border-[#7B8069]/20">
                          {msg.planData.restaurants.map(r => (
                            <button
                              key={r.id}
                              onClick={() => selectRestFromList(msg.id, r)}
                              className={`text-[10px] px-2 py-1 rounded-sm border transition-all ${msg.planData?.selectedRestaurant?.id === r.id ? 'bg-[#B0361B]/10 border-[#B0361B] text-[#B0361B] font-bold' : 'border-[#7B8069]/40 text-[#7B8069]'}`}
                            >
                              {r.name} ({r.rating}★)
                            </button>
                          ))}
                        </div>

                        <div className="divide-y divide-[#7B8069]/20">
                          {msg.planData.foodCartDetails.items.map((item: any) => (
                            <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                              <span>{item.name} (x{item.quantity})</span>
                              <span className="font-bold">₹{item.totalCost}</span>
                            </div>
                          ))}
                        </div>

                        {/* Coupons code */}
                        {msg.planData.availableCoupons.length > 0 && (
                          <div className="bg-[#F0EBDA]/40 p-3 rounded-md border border-[#7B8069]/20 space-y-2">
                            <span className="text-[8px] uppercase tracking-wider font-bold text-[#B0361B] block">Discounts</span>
                            {msg.planData.availableCoupons.map(c => (
                              <div key={c.code} className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-[#B0361B]">{c.code}</span>
                                <Button
                                  onClick={() => handleApplyCouponCode(msg.id, c.code)}
                                  disabled={msg.planData?.appliedCoupon === c.code}
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-2 border-[#7B8069]"
                                >
                                  {msg.planData?.appliedCoupon === c.code ? 'Applied' : 'Apply'}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Budget Bar */}
                        <div className="bg-[#F0EBDA]/60 p-3 rounded-md border border-[#7B8069]/40 space-y-2">
                          <div className="flex justify-between text-[11px] text-[#7B8069]">
                            <span>Cart Total: <strong>₹{msg.planData.foodCartDetails.billBreakdown.grandTotal}</strong></span>
                            <span>Limit: <strong>₹{msg.planData.budget}</strong></span>
                          </div>
                          <Progress value={Math.min((msg.planData.foodCartDetails.billBreakdown.grandTotal / msg.planData.budget) * 100, 100)} className="h-1 bg-[#F0EBDA]" />
                        </div>

                        {/* Primary checkout CTA in clay red */}
                        <Button
                          onClick={() => handleOrderCheckout(msg.id)}
                          disabled={loading || msg.planData.foodCartDetails.billBreakdown.grandTotal > 1000}
                          className="w-full bg-[#B0361B] hover:bg-[#962d16] text-[#F8F3E1] font-sans-jp tracking-wider text-xs h-9 rounded-md"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Order Cooked Meals (COD)
                        </Button>

                        {/* Tracking details */}
                        {msg.planData.trackingDetails && (
                          <div className="bg-[#B0361B]/5 border border-[#B0361B]/35 p-3 rounded-md flex items-center justify-between text-xs font-serif animate-pulse">
                            <div>
                              <span className="text-[#B0361B] font-bold block">Rider Assigned</span>
                              <span className="text-[10px] text-[#7B8069]">Rider {msg.planData.trackingDetails.deliveryPartner} has left the store.</span>
                            </div>
                            <span className="font-extrabold text-[#B0361B]">{msg.planData.trackingDetails.eta}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-[#1E2016] text-[#F8F3E1] flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span className="text-xs text-[#7B8069] font-sans-jp tracking-wider">Generating customized recipe plan...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (if chat is fresh) */}
        {messages.length === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 animate-in fade-in duration-300">
            <button 
              onClick={() => handleSendMessage("I have a super busy day at work. I need quick high-protein meals with a budget of ₹450.")}
              className="p-4 bg-[#F8F3E1] border border-[#7B8069] rounded-md text-left hover:bg-[#F0EBDA] transition-all text-xs space-y-1.5"
            >
              <span className="font-sans-jp tracking-wider text-[8px] uppercase text-[#B0361B] font-bold">Quick & Protein</span>
              <p className="text-[#1E2016] font-serif leading-relaxed">"I have a super busy day at work. I need quick high-protein meals with a budget of ₹450."</p>
            </button>
            <button 
              onClick={() => handleSendMessage("Help me plan a relaxing weekend. Vegetarian recipes, budget within ₹300.")}
              className="p-4 bg-[#F8F3E1] border border-[#7B8069] rounded-md text-left hover:bg-[#F0EBDA] transition-all text-xs space-y-1.5"
            >
              <span className="font-sans-jp tracking-wider text-[8px] uppercase text-[#B0361B] font-bold">Vegetarian Feast</span>
              <p className="text-[#1E2016] font-serif leading-relaxed">"Help me plan a relaxing weekend. Vegetarian recipes, budget within ₹300."</p>
            </button>
            <button 
              onClick={() => handleSendMessage("Generate a balanced meal plan for a standard moderate schedule, budget ₹500.")}
              className="p-4 bg-[#F8F3E1] border border-[#7B8069] rounded-md text-left hover:bg-[#F0EBDA] transition-all text-xs space-y-1.5"
            >
              <span className="font-sans-jp tracking-wider text-[8px] uppercase text-[#B0361B] font-bold">Moderate & Balanced</span>
              <p className="text-[#1E2016] font-serif leading-relaxed">"Generate a balanced meal plan for a standard moderate schedule, budget ₹500."</p>
            </button>
          </div>
        )}

        {/* Message Input Form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
          className="bg-[#F8F3E1] border border-[#7B8069] rounded-lg p-2.5 flex items-center gap-3 w-full"
        >
          <input
            type="text"
            placeholder="Describe your day profile, diet preferences, and target budget..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent text-sm font-serif outline-none border-none text-[#1E2016] px-2 placeholder-[#7B8069]"
          />
          <Button 
            type="submit"
            disabled={loading || !inputText.trim()}
            className="bg-[#1E2016] text-[#F8F3E1] hover:bg-[#7B8069] rounded-md w-9 h-9 flex items-center justify-center p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </main>

      {/* Checkout Dialog */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="bg-[#F8F3E1] border border-[#7B8069] text-[#1E2016] max-w-[420px] font-serif">
          <DialogHeader className="items-center text-center space-y-2">
            <div className="w-12 h-12 bg-[#B0361B]/10 text-[#B0361B] rounded-full flex items-center justify-center mb-1">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <DialogTitle className="text-xl font-display">Order Placed Successfully!</DialogTitle>
            <DialogDescription className="text-[#7B8069] text-xs font-serif">
              Your order has been placed via Swiggy {activeTabGlobal === 'instamart' ? 'Instamart' : 'Food Delivery'}.
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
              }}
              className="w-full bg-[#B0361B] hover:bg-[#962d16] text-[#F8F3E1] font-sans-jp tracking-wider font-bold rounded-md py-2"
            >
              Awesome
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
