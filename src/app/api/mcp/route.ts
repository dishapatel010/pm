import { NextResponse } from 'next/server';

// Mock DB for Instamart
const PRODUCTS = [
  { id: 'p1', name: 'Organic Eggs (Pack of 6)', price: 120, category: 'Dairy & Eggs', substituteId: 'p2', substituteText: 'Regular Eggs (Pack of 6)' },
  { id: 'p2', name: 'Regular Eggs (Pack of 6)', price: 70, category: 'Dairy & Eggs', substituteId: null },
  { id: 'p3', name: 'Organic Almond Milk (1L)', price: 250, category: 'Dairy & Eggs', substituteId: 'p4', substituteText: 'Regular Cow Milk (1L)' },
  { id: 'p4', name: 'Regular Cow Milk (1L)', price: 60, category: 'Dairy & Eggs', substituteId: null },
  { id: 'p5', name: 'Premium Avocado (2pc)', price: 299, category: 'Fruits & Vegetables', substituteId: 'p6', substituteText: 'Banana (1 dozen)' },
  { id: 'p6', name: 'Banana (1 dozen)', price: 60, category: 'Fruits & Vegetables', substituteId: null },
  { id: 'p7', name: 'Fresh Spinach (250g)', price: 30, category: 'Fruits & Vegetables', substituteId: null },
  { id: 'p8', name: 'Chicken Breast (500g)', price: 220, category: 'Meat & Seafood', substituteId: 'p9', substituteText: 'Tofu (200g)' },
  { id: 'p9', name: 'Tofu (200g)', price: 80, category: 'Dairy & Eggs', substituteId: null },
  { id: 'p10', name: 'Premium Paneer (200g)', price: 120, category: 'Dairy & Eggs', substituteId: 'p9', substituteText: 'Tofu (200g)' },
  { id: 'p11', name: 'Quinoa (500g)', price: 180, category: 'Atta, Rice & Dals', substituteId: 'p12', substituteText: 'Brown Rice (1kg)' },
  { id: 'p12', name: 'Brown Rice (1kg)', price: 90, category: 'Atta, Rice & Dals', substituteId: 'p13', substituteText: 'White Rice (1kg)' },
  { id: 'p13', name: 'White Rice (1kg)', price: 60, category: 'Atta, Rice & Dals', substituteId: null },
  { id: 'p14', name: 'Rolled Oats (1kg)', price: 150, category: 'Breakfast Cereals', substituteId: null }
];

// Mock DB for Food
const RESTAURANTS = [
  { id: 'r1', name: 'Healthy Bowls Co.', rating: 4.5, distance: '1.2 km', availabilityStatus: 'OPEN' },
  { id: 'r2', name: 'Biryani Express', rating: 4.2, distance: '2.5 km', availabilityStatus: 'OPEN' },
  { id: 'r3', name: 'The Breakfast Club', rating: 4.6, distance: '3.1 km', availabilityStatus: 'OPEN' }
];

const MENUS: Record<string, any[]> = {
  r1: [
    { id: 'f1', name: 'High Protein Chicken Salad', price: 220, desc: 'Fresh greens topped with grilled chicken breast and vinaigrette.' },
    { id: 'f2', name: 'Quinoa Veggie Stir Fry', price: 180, desc: 'Organic stir fried quinoa with broccoli and mushrooms.' }
  ],
  r2: [
    { id: 'f3', name: 'Classic Chicken Biryani', price: 250, desc: 'Aromatic basmati rice cooked with chicken and spices.' },
    { id: 'f4', name: 'Veg Dum Biryani', price: 190, desc: 'Traditional vegetable biryani served with raita.' }
  ],
  r3: [
    { id: 'f5', name: 'Avocado Toast with Egg', price: 280, desc: 'Smashed premium avocado on whole grain sourdough toast topped with a poached egg.' },
    { id: 'f6', name: 'Banana Oats Pancake', desc: 'Fluffy rolled oats pancake topped with banana slices.', price: 140 }
  ]
};

const ADDRESSES = [
  { id: 'addr_1', name: 'Home', address: 'Flat 402, Sunshine Apartments, Indiranagar, Bengaluru - 560038' },
  { id: 'addr_2', name: 'Office', address: 'Swiggy HQ, Devarabeesanahalli, Outer Ring Road, Bengaluru - 560103' }
];

// In-Memory Carts
let imCart = { items: [] as any[], addressId: 'addr_1' };
let foodCart = { restaurantId: '', items: [] as any[], coupon: null as any };

function calculateImCart() {
  let itemTotal = 0;
  const detailedItems = imCart.items.map(item => {
    const prod = PRODUCTS.find(p => p.id === item.productId);
    const cost = prod ? prod.price * item.quantity : 0;
    itemTotal += cost;
    return {
      id: prod?.id || item.productId,
      name: prod?.name || 'Unknown Item',
      price: prod?.price || 0,
      quantity: item.quantity,
      category: prod?.category || 'General',
      totalCost: cost,
      substituteId: prod?.substituteId || null,
      substituteText: prod?.substituteText || ''
    };
  });
  const deliveryFee = itemTotal > 0 ? 30 : 0;
  const platformFee = itemTotal > 0 ? 5 : 0;
  const discount = itemTotal > 300 ? 50 : 0;
  return {
    items: detailedItems,
    billBreakdown: { itemTotal, deliveryFee, platformFee, discount, grandTotal: itemTotal + deliveryFee + platformFee - discount }
  };
}

function calculateFoodCart() {
  let itemTotal = 0;
  const detailedItems = foodCart.items.map(item => {
    // Find item in all menus
    let foundFood: any = null;
    for (const rId in MENUS) {
      const match = MENUS[rId].find(f => f.id === item.itemId);
      if (match) { foundFood = match; break; }
    }
    const cost = foundFood ? foundFood.price * item.quantity : 0;
    itemTotal += cost;
    return {
      id: item.itemId,
      name: foundFood?.name || 'Dish',
      price: foundFood?.price || 0,
      quantity: item.quantity,
      totalCost: cost
    };
  });
  const deliveryFee = itemTotal > 0 ? 35 : 0;
  const platformFee = itemTotal > 0 ? 5 : 0;
  const discount = foodCart.coupon ? 50 : 0;
  return {
    restaurantId: foodCart.restaurantId,
    items: detailedItems,
    billBreakdown: { itemTotal, deliveryFee, platformFee, discount, grandTotal: itemTotal + deliveryFee + platformFee - discount }
  };
}

// Unified API Router supporting both Swiggy Instamart and Swiggy Food MCP servers
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jsonrpc, method, params, id } = body;

    // Retrieve active Swiggy Access Token from cookies
    const cookies = request.headers.get('cookie') || '';
    const getCookie = (name: string) => {
      const match = cookies.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[2]) : null;
    };
    const accessToken = getCookie('swiggy_access_token');

    // Route calls dynamically to real /im (Instamart) or /food (Food) endpoints based on method / params
    if (accessToken) {
      const isFoodTool = params?.name && (
        params.name.includes('food') || 
        params.name.includes('restaurant') || 
        params.name.includes('menu') || 
        params.name.includes('coupon')
      );
      const serverPath = isFoodTool ? '/food' : '/im';
      console.log(`Proxying tool: ${params?.name || method} to real Swiggy MCP server path ${serverPath}`);

      try {
        const swiggyRes = await fetch(`https://mcp.swiggy.com${serverPath}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(body)
        });

        if (swiggyRes.ok) {
          const swiggyData = await swiggyRes.json();
          return NextResponse.json(swiggyData);
        }
      } catch (err) {
        console.error(`Dynamic Real proxy request to Swiggy ${serverPath} failed. Falling back to Mock:`, err);
      }
    }

    // --- Unified Sandbox Mock mode ---
    if (jsonrpc !== '2.0') {
      return NextResponse.json({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request' }, id }, { status: 400 });
    }

    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        result: {
          tools: [
            // Shared addresses tool
            { name: 'get_addresses', description: 'Get all saved delivery addresses for the user.', inputSchema: { type: 'object', properties: {} } },
            // Instamart Server Tools
            { name: 'search_products', description: 'Search for grocery products on Swiggy Instamart.', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
            { name: 'get_cart', description: 'Get the current Swiggy Instamart grocery cart.', inputSchema: { type: 'object', properties: {} } },
            { name: 'update_cart', description: 'Update the Swiggy Instamart cart items.', inputSchema: { type: 'object', properties: { items: { type: 'array', items: { type: 'object', properties: { productId: { type: 'string' }, quantity: { type: 'number' } }, required: ['productId', 'quantity'] } } }, required: ['items'] } },
            { name: 'checkout', description: 'Checkout the Swiggy Instamart grocery order.', inputSchema: { type: 'object', properties: {} } },
            // Food Server Tools
            { name: 'search_restaurants', description: 'Search for open restaurants.', inputSchema: { type: 'object', properties: { addressId: { type: 'string' }, query: { type: 'string' } }, required: ['query'] } },
            { name: 'get_restaurant_menu', description: 'Get menu items of a restaurant.', inputSchema: { type: 'object', properties: { restaurantId: { type: 'string' } }, required: ['restaurantId'] } },
            { name: 'update_food_cart', description: 'Update food cart items.', inputSchema: { type: 'object', properties: { restaurantId: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { itemId: { type: 'string' }, quantity: { type: 'number' } }, required: ['itemId', 'quantity'] } } }, required: ['restaurantId', 'items'] } },
            { name: 'get_food_cart', description: 'Get current food cart.', inputSchema: { type: 'object', properties: {} } },
            { name: 'fetch_food_coupons', description: 'Get coupons for active food orders.', inputSchema: { type: 'object', properties: {} } },
            { name: 'apply_food_coupon', description: 'Apply coupon code.', inputSchema: { type: 'object', properties: { code: { type: 'string' } }, required: ['code'] } },
            { name: 'place_food_order', description: 'Place food delivery order with Cash on Delivery.', inputSchema: { type: 'object', properties: { paymentMethod: { type: 'string' } }, required: ['paymentMethod'] } },
            { name: 'track_food_order', description: 'Track food order delivery progress.', inputSchema: { type: 'object', properties: { orderId: { type: 'string' } }, required: ['orderId'] } }
          ]
        },
        id
      });
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params;

      // Shared Address
      if (name === 'get_addresses') {
        return NextResponse.json({ jsonrpc: '2.0', result: { success: true, addresses: ADDRESSES }, id });
      }

      // --- Instamart Handlers ---
      if (name === 'search_products') {
        const query = (args.query || '').toLowerCase();
        const matches = PRODUCTS.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
        return NextResponse.json({ jsonrpc: '2.0', result: { success: true, products: matches }, id });
      }
      if (name === 'get_cart') {
        return NextResponse.json({ jsonrpc: '2.0', result: { success: true, cart: calculateImCart() }, id });
      }
      if (name === 'update_cart') {
        imCart.items = args.items || [];
        return NextResponse.json({ jsonrpc: '2.0', result: { success: true, cart: calculateImCart() }, id });
      }
      if (name === 'checkout') {
        const bill = calculateImCart().billBreakdown;
        imCart.items = [];
        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            success: true,
            orderId: 'IM_' + Math.random().toString(36).substring(2, 11).toUpperCase(),
            message: 'Instamart Order placed successfully!',
            deliveredTo: ADDRESSES[0].address,
            bill
          },
          id
        });
      }

      // --- Food Handlers ---
      if (name === 'search_restaurants') {
        const query = (args.query || '').toLowerCase();
        const matches = RESTAURANTS.filter(r => r.name.toLowerCase().includes(query));
        return NextResponse.json({ jsonrpc: '2.0', result: { success: true, restaurants: matches.length > 0 ? matches : RESTAURANTS }, id });
      }
      if (name === 'get_restaurant_menu') {
        const rId = args.restaurantId || 'r1';
        return NextResponse.json({ jsonrpc: '2.0', result: { success: true, restaurantId: rId, items: MENUS[rId] || [] }, id });
      }
      if (name === 'update_food_cart') {
        foodCart.restaurantId = args.restaurantId;
        foodCart.items = args.items || [];
        return NextResponse.json({ jsonrpc: '2.0', result: { success: true, cart: calculateFoodCart() }, id });
      }
      if (name === 'get_food_cart') {
        return NextResponse.json({ jsonrpc: '2.0', result: { success: true, cart: calculateFoodCart() }, id });
      }
      if (name === 'fetch_food_coupons') {
        return NextResponse.json({ jsonrpc: '2.0', result: { success: true, coupons: [{ code: 'WELCOME50', description: 'Get flat ₹50 off. Valid on COD.', requiresOnlinePayment: false }] }, id });
      }
      if (name === 'apply_food_coupon') {
        foodCart.coupon = args.code;
        return NextResponse.json({ jsonrpc: '2.0', result: { success: true, cart: calculateFoodCart() }, id });
      }
      if (name === 'place_food_order') {
        const bill = calculateFoodCart().billBreakdown;
        foodCart.items = [];
        foodCart.coupon = null;
        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            success: true,
            orderId: 'FD_' + Math.random().toString(36).substring(2, 11).toUpperCase(),
            message: 'Food Order placed successfully!',
            deliveredTo: ADDRESSES[0].address,
            bill
          },
          id
        });
      }
      if (name === 'track_food_order') {
        return NextResponse.json({ jsonrpc: '2.0', result: { success: true, status: 'IN_TRANSIT', eta: '15 mins away', deliveryPartner: 'Ramesh K.' }, id });
      }

      return NextResponse.json({ jsonrpc: '2.0', error: { code: -32601, message: `Method not found: ${name}` }, id }, { status: 404 });
    }

    return NextResponse.json({ jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ jsonrpc: '2.0', error: { code: -32603, message: err.message || 'Internal Error' } }, { status: 500 });
  }
}
