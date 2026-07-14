const mongoose = require('mongoose');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

function getJwtCookie(res) {
  const rawCookies = res.headers.get('set-cookie');
  if (!rawCookies) return null;
  const match = rawCookies.match(/jwt=([^;]+)/);
  return match ? `jwt=${match[1]}` : null;
}

async function runTests() {
  console.log('Connecting to database for test setup/cleanup...');
  await mongoose.connect(process.env.MONGO_URI);

  // Clean up existing test data
  const adminEmail = 'cart_admin@test.com';
  const shopperEmail = 'cart_shopper@test.com';
  
  // Find and remove test users
  const testUsers = await User.find({ email: { $in: [adminEmail, shopperEmail] } });
  const userIds = testUsers.map(u => u._id);
  
  await Cart.deleteMany({ user: { $in: userIds } });
  await User.deleteMany({ email: { $in: [adminEmail, shopperEmail] } });
  await Product.deleteMany({ name: { $regex: /^Cart Test Product/ } });
  
  console.log('Database cleanup done.');
  await mongoose.disconnect();

  console.log('\n--- Starting Cart Integration Tests ---\n');

  // 1. Register Admin to create products
  console.log('1. Registering Admin user...');
  const adminRegisterRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Cart Admin',
      email: adminEmail,
      password: 'password123',
      role: 'admin'
    })
  });
  const adminData = await adminRegisterRes.json();
  const adminCookie = getJwtCookie(adminRegisterRes);
  if (!adminCookie) {
    console.error('Failed to get Admin cookie:', adminData);
    process.exit(1);
  }

  // 2. Create Products
  console.log('2. Creating Test Product A (Price: $10.00, Stock: 5)...');
  const prodARes = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
    body: JSON.stringify({
      name: 'Cart Test Product A',
      description: 'Test product A description',
      price: 10.00,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      category: 'Test',
      stock: 5
    })
  });
  const productA = await prodARes.json();

  console.log('Creating Test Product B (Price: $20.00, Stock: 2)...');
  const prodBRes = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
    body: JSON.stringify({
      name: 'Cart Test Product B',
      description: 'Test product B description',
      price: 20.00,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      category: 'Test',
      stock: 2
    })
  });
  const productB = await prodBRes.json();

  if (!productA._id || !productB._id) {
    console.error('Failed to create test products:', productA, productB);
    process.exit(1);
  }
  console.log('Test products created.');

  // 3. Register Shopper
  console.log('\n3. Registering Shopper user...');
  const shopperRegisterRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Cart Shopper',
      email: shopperEmail,
      password: 'password123',
      role: 'user'
    })
  });
  const shopperCookie = getJwtCookie(shopperRegisterRes);
  if (!shopperCookie) {
    console.error('Failed to register Shopper user');
    process.exit(1);
  }
  console.log('Shopper registered.');

  // 4. Get Initial Cart
  console.log('\n4. Fetching empty cart...');
  const getCartRes = await fetch(`${API_BASE}/cart`, {
    headers: { 'Cookie': shopperCookie }
  });
  const initialCart = await getCartRes.json();
  if (getCartRes.status === 200 && initialCart.items.length === 0 && initialCart.totalPrice === 0) {
    console.log('PASS: Initial cart is empty. Total Price: $0');
  } else {
    console.error('FAIL: Expected empty cart but got:', getCartRes.status, initialCart);
    process.exit(1);
  }

  // 5. Add Product A (Qty: 1)
  console.log('\n5. Adding Product A (Qty: 1) to cart...');
  const addARes = await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': shopperCookie },
    body: JSON.stringify({ productId: productA._id, quantity: 1 })
  });
  const cartAfterA1 = await addARes.json();
  if (addARes.status === 200 && cartAfterA1.items.length === 1 && cartAfterA1.totalPrice === 10) {
    console.log('PASS: Added Product A. Total Price is $10.00');
  } else {
    console.error('FAIL: Failed to add Product A:', addARes.status, cartAfterA1);
    process.exit(1);
  }

  // 6. Add Product A (Qty: 2) -> should aggregate to 3
  console.log('\n6. Adding Product A (Qty: 2) again...');
  const addA2Res = await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': shopperCookie },
    body: JSON.stringify({ productId: productA._id, quantity: 2 })
  });
  const cartAfterA2 = await addA2Res.json();
  const prodAItem = cartAfterA2.items.find(item => item.product._id === productA._id);
  if (addA2Res.status === 200 && prodAItem && prodAItem.quantity === 3 && cartAfterA2.totalPrice === 30) {
    console.log('PASS: Product A quantity aggregated to 3. Total Price is $30.00');
  } else {
    console.error('FAIL: Failed to aggregate Product A quantity:', addA2Res.status, cartAfterA2);
    process.exit(1);
  }

  // 7. Add Product A (Qty: 3) -> should exceed stock of 5 (current in cart: 3, adding 3 makes 6)
  console.log('\n7. Testing stock limit violation (Adding 3 more Product A, stock limit is 5)...');
  const addA3Res = await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': shopperCookie },
    body: JSON.stringify({ productId: productA._id, quantity: 3 })
  });
  const addA3Body = await addA3Res.json();
  if (addA3Res.status === 400 && addA3Body.message && addA3Body.message.includes('stock')) {
    console.log(`PASS: Stock limit error thrown as expected: "${addA3Body.message}"`);
  } else {
    console.error('FAIL: Expected stock limit error but got:', addA3Res.status, addA3Body);
    process.exit(1);
  }

  // 8. Add Product B (Qty: 1)
  console.log('\n8. Adding Product B (Qty: 1) to cart...');
  const addBRes = await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': shopperCookie },
    body: JSON.stringify({ productId: productB._id, quantity: 1 })
  });
  const cartWithB = await addBRes.json();
  if (addBRes.status === 200 && cartWithB.items.length === 2 && cartWithB.totalPrice === 50) {
    console.log('PASS: Added Product B. Total Price is $50.00 (Product A: $30.00 + Product B: $20.00)');
  } else {
    console.error('FAIL: Failed to add Product B:', addBRes.status, cartWithB);
    process.exit(1);
  }

  // 9. Update Product A quantity to 2
  console.log('\n9. Updating Product A quantity to 2...');
  const updateARes = await fetch(`${API_BASE}/cart/${productA._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': shopperCookie },
    body: JSON.stringify({ quantity: 2 })
  });
  const cartUpdateA = await updateARes.json();
  const updatedA = cartUpdateA.items.find(item => item.product._id === productA._id);
  if (updateARes.status === 200 && updatedA.quantity === 2 && cartUpdateA.totalPrice === 40) {
    console.log('PASS: Updated Product A quantity to 2. Total Price is $40.00 (Product A: $20.00 + Product B: $20.00)');
  } else {
    console.error('FAIL: Failed to update quantity:', updateARes.status, cartUpdateA);
    process.exit(1);
  }

  // 10. Remove Product A
  console.log('\n10. Removing Product A from cart...');
  const removeARes = await fetch(`${API_BASE}/cart/${productA._id}`, {
    method: 'DELETE',
    headers: { 'Cookie': shopperCookie }
  });
  const cartRemoveA = await removeARes.json();
  const hasA = cartRemoveA.items.some(item => item.product._id === productA._id);
  if (removeARes.status === 200 && !hasA && cartRemoveA.totalPrice === 20) {
    console.log('PASS: Product A removed. Total Price is $20.00 (only Product B remains)');
  } else {
    console.error('FAIL: Failed to remove Product A:', removeARes.status, cartRemoveA);
    process.exit(1);
  }

  // 11. Clear Cart
  console.log('\n11. Clearing all items in cart...');
  const clearRes = await fetch(`${API_BASE}/cart`, {
    method: 'DELETE',
    headers: { 'Cookie': shopperCookie }
  });
  const cartCleared = await clearRes.json();
  if (clearRes.status === 200 && cartCleared.items.length === 0 && cartCleared.totalPrice === 0) {
    console.log('PASS: Cart cleared. Total Price is $0');
  } else {
    console.error('FAIL: Failed to clear cart:', clearRes.status, cartCleared);
    process.exit(1);
  }

  console.log('\n======================================');
  console.log('ALL CART INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('======================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
