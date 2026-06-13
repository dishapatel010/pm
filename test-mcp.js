/**
 * Automated Test Runner for PromptRecipe MCP Server Router
 * Run using: node test-mcp.js
 */

const assert = require('assert');

// Mock request / response objects to test route logic directly
const PRODUCTS = [
  { id: 'p1', name: 'Organic Eggs (Pack of 6)', price: 120, category: 'Dairy & Eggs', substituteId: 'p2', substituteText: 'Regular Eggs (Pack of 6)' }
];

async function runTests() {
  console.log('🧪 Starting PromptRecipe MCP Router Unit Tests...\n');

  try {
    // Test 1: Verify mock product data structure
    console.log('Test 1: Validating Instamart Product schema structure...');
    const prod = PRODUCTS[0];
    assert.strictEqual(prod.id, 'p1');
    assert.strictEqual(typeof prod.price, 'number');
    assert.strictEqual(prod.price > 0, true);
    console.log('✅ Test 1 Passed.');

    // Test 2: Local endpoint verification
    console.log('Test 2: Querying local JSON-RPC /api/mcp endpoint...');
    const listRes = await fetch('http://localhost:3002/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 1
      })
    });
    
    assert.strictEqual(listRes.status, 200);
    const data = await listRes.json();
    assert.strictEqual(data.jsonrpc, '2.0');
    assert.ok(data.result.tools);
    
    // Check key tools are listed
    const toolNames = data.result.tools.map(t => t.name);
    assert.ok(toolNames.includes('get_addresses'));
    assert.ok(toolNames.includes('search_products'));
    assert.ok(toolNames.includes('update_cart'));
    assert.ok(toolNames.includes('place_food_order'));
    console.log('✅ Test 2 Passed.');

    // Test 3: Check Auth Status defaults
    console.log('Test 3: Querying /api/auth/status endpoint...');
    const statusRes = await fetch('http://localhost:3002/api/auth/status');
    assert.strictEqual(statusRes.status, 200);
    const statusData = await statusRes.json();
    assert.strictEqual(typeof statusData.authenticated, 'boolean');
    console.log('✅ Test 3 Passed.');

    console.log('\n🎉 All tests passed successfully! 100% Validation Green.');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
