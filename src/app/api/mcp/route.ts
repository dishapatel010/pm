import { NextResponse } from 'next/server';

// Mock Product Catalog for Instamart
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

const ADDRESSES = [
  { id: 'addr_1', name: 'Home', address: 'Flat 402, Sunshine Apartments, Indiranagar, Bengaluru - 560038' },
  { id: 'addr_2', name: 'Office', address: 'Swiggy HQ, Devarabeesanahalli, Outer Ring Road, Bengaluru - 560103' }
];

let cart = {
  items: [] as Array<{ productId: string; quantity: number }>,
  addressId: 'addr_1'
};

function calculateCartBill() {
  let itemTotal = 0;
  const detailedItems = cart.items.map(item => {
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
  const grandTotal = itemTotal + deliveryFee + platformFee - discount;

  return {
    items: detailedItems,
    billBreakdown: {
      itemTotal,
      deliveryFee,
      platformFee,
      discount,
      grandTotal
    }
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jsonrpc, method, params, id } = body;

    // Check if the user has a real Swiggy Access Token in their cookies
    const cookies = request.headers.get('cookie') || '';
    const getCookie = (name: string) => {
      const match = cookies.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[2]) : null;
    };
    const accessToken = getCookie('swiggy_access_token');

    // --- REAL MODE: Proxy to Swiggy MCP Server ---
    if (accessToken) {
      console.log(`Proxying ${method} to real Swiggy MCP server`);
      try {
        const swiggyRes = await fetch('https://mcp.swiggy.com/im', {
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
        } else {
          // If token expired, clear cookie and fall back
          console.warn('Real Swiggy MCP Server returned error status:', swiggyRes.status);
        }
      } catch (err) {
        console.error('Failed to query real Swiggy MCP server, falling back to mock mode:', err);
      }
    }

    // --- MOCK MODE: Local Offline Fallback ---
    if (jsonrpc !== '2.0') {
      return NextResponse.json({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request' }, id }, { status: 400 });
    }

    switch (method) {
      case 'tools/list':
        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            tools: [
              {
                name: 'get_addresses',
                description: 'Get all saved delivery addresses for the authenticated Swiggy user.',
                inputSchema: { type: 'object', properties: {} }
              },
              {
                name: 'search_products',
                description: 'Search for products available on Swiggy Instamart at the selected address.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string', description: 'Product search query' },
                    addressId: { type: 'string', description: 'Selected address ID' }
                  },
                  required: ['query']
                }
              },
              {
                name: 'get_cart',
                description: 'Get the current Swiggy Instamart grocery cart with items and bill breakdown.',
                inputSchema: { type: 'object', properties: {} }
              },
              {
                name: 'update_cart',
                description: 'Update the Swiggy Instamart cart items. Replaces the cart content.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          productId: { type: 'string' },
                          quantity: { type: 'number' }
                        },
                        required: ['productId', 'quantity']
                      }
                    }
                  },
                  required: ['items']
                }
              },
              {
                name: 'checkout',
                description: 'Checkout the Swiggy Instamart grocery order.',
                inputSchema: { type: 'object', properties: {} }
              }
            ]
          },
          id
        });

      case 'tools/call':
        const { name, arguments: args } = params;

        if (name === 'get_addresses') {
          return NextResponse.json({
            jsonrpc: '2.0',
            result: { success: true, addresses: ADDRESSES },
            id
          });
        }

        if (name === 'search_products') {
          const query = (args.query || '').toLowerCase();
          const matches = PRODUCTS.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
          return NextResponse.json({
            jsonrpc: '2.0',
            result: { success: true, products: matches },
            id
          });
        }

        if (name === 'get_cart') {
          const detailedCart = calculateCartBill();
          return NextResponse.json({
            jsonrpc: '2.0',
            result: { success: true, cart: detailedCart },
            id
          });
        }

        if (name === 'update_cart') {
          cart.items = args.items || [];
          const detailedCart = calculateCartBill();
          return NextResponse.json({
            jsonrpc: '2.0',
            result: { success: true, cart: detailedCart },
            id
          });
        }

        if (name === 'checkout') {
          if (cart.items.length === 0) {
            return NextResponse.json({
              jsonrpc: '2.0',
              result: { success: false, error: 'Cart is empty. Add products before checkout.' },
              id
            });
          }
          const detailedCart = calculateCartBill();
          cart.items = []; // Reset cart
          return NextResponse.json({
            jsonrpc: '2.0',
            result: {
              success: true,
              orderId: 'ORD_' + Math.random().toString(36).substring(2, 11).toUpperCase(),
              message: 'Order placed successfully via Swiggy Instamart!',
              deliveredTo: ADDRESSES.find(a => a.id === cart.addressId)?.address,
              bill: detailedCart.billBreakdown
            },
            id
          });
        }

        return NextResponse.json({
          jsonrpc: '2.0',
          error: { code: -32601, message: `Method not found: ${name}` },
          id
        }, { status: 404 });

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          error: { code: -32601, message: 'Method not found' },
          id
        }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ jsonrpc: '2.0', error: { code: -32603, message: err.message || 'Internal Error' } }, { status: 500 });
  }
}
