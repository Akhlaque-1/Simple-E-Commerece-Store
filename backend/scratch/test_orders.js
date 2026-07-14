const mongoose = require('mongoose');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
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

  const adminEmail = 'order_admin@test.com';
  const shopperAEmail = 'shopper_a@test.com';
  const shopperBEmail = 'shopper_b@test.com';

  // Find and clean up test users, products, carts, and orders
  const testUsers = await User.find({ email: { $in: [adminEmail, shopperAEmail, shopperBEmail] } });
  const userIds = testUsers.map(u => u._id);

  await Order.deleteMany({ user: { $in: userIds } });
  await Cart.deleteMany({ user: { $in: userIds } });
  await User.deleteMany({ email: { $in: [adminEmail, shopperAEmail, shopperBEmail] } });
  await Product.deleteMany({ name: { $regex: /^Order Test Product/ } });

  console.log('Database cleanup done.');
  await mongoose.disconnect();

  console.log('\n--- Starting Order Integration Tests ---\n');

  // 1. Register Admin
  console.log('1. Registering Admin user...');
  const adminRegisterRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Order Admin',
      email: adminEmail,
      password: 'password123',
      role: 'admin'
    })
  });
  const adminCookie = getJwtCookie(adminRegisterRes);
  if (!adminCookie) {
    console.error('Failed to get Admin cookie');
    process.exit(1);
  }

  // 2. Create Product
  console.log('2. Creating Test Product (Price: $50.00, Stock: 10)...');
  const prodRes = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
    body: JSON.stringify({
      name: 'Order Test Product A',
      description: 'Test product for orders',
      price: 50.00,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      category: 'Test',
      stock: 10
    })
  });
  const product = await prodRes.json();
  if (!product._id) {
    console.error('Failed to create product:', product);
    process.exit(1);
  }

  // 3. Register Shopper A
  console.log('\n3. Registering Shopper A...');
  const shopperARegisterRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Shopper A',
      email: shopperAEmail,
      password: 'password123',
      role: 'user'
    })
  });
  const shopperACookie = getJwtCookie(shopperARegisterRes);
  if (!shopperACookie) {
    console.error('Failed to get Shopper A cookie');
    process.exit(1);
  }

  // 4. Add Product to Shopper A's Cart (Qty: 3)
  console.log('4. Adding 3 units to Shopper A\'s cart...');
  const addCartRes = await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': shopperACookie },
    body: JSON.stringify({ productId: product._id, quantity: 3 })
  });
  const cartAfterAdd = await addCartRes.json();
  if (addCartRes.status !== 200 || cartAfterAdd.totalPrice !== 150) {
    console.error('Failed to add product to cart:', addCartRes.status, cartAfterAdd);
    process.exit(1);
  }
  console.log('Product added to cart. Cart total: $150.00');

  // 5. Checkout Shopper A
  console.log('\n5. Checking out Shopper A...');
  const shippingAddress = {
    address: '123 Main St',
    city: 'Testville',
    postalCode: '12345',
    country: 'Testland'
  };

  const checkoutRes = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': shopperACookie },
    body: JSON.stringify({ shippingAddress })
  });
  const order = await checkoutRes.json();
  if (checkoutRes.status === 201 && order._id && order.totalPrice === 150) {
    console.log('PASS: Checkout successful. Order Created ID:', order._id);
  } else {
    console.error('FAIL: Checkout failed:', checkoutRes.status, order);
    process.exit(1);
  }

  const orderId = order._id;

  // 6. Verify stock deduction & cart clear in DB
  console.log('\n6. Verifying database state post-checkout...');
  await mongoose.connect(process.env.MONGO_URI);
  const updatedProduct = await Product.findById(product._id);
  const clearedCart = await Cart.findOne({ user: order.user });
  await mongoose.disconnect();

  if (updatedProduct.stock === 7) {
    console.log('PASS: Product stock correctly decremented from 10 to 7.');
  } else {
    console.error('FAIL: Product stock is:', updatedProduct.stock);
    process.exit(1);
  }

  if (clearedCart.items.length === 0) {
    console.log('PASS: Shopper A\'s cart was cleared successfully.');
  } else {
    console.error('FAIL: Cart items still present:', clearedCart.items);
    process.exit(1);
  }

  // 7. Get Shopper A's order history
  console.log('\n7. Testing My Orders (Order History) for Shopper A...');
  const myOrdersRes = await fetch(`${API_BASE}/orders/myorders`, {
    headers: { 'Cookie': shopperACookie }
  });
  const myOrders = await myOrdersRes.json();
  if (myOrdersRes.status === 200 && Array.isArray(myOrders) && myOrders.length === 1 && myOrders[0]._id === orderId) {
    console.log('PASS: Order History contains correct order.');
  } else {
    console.error('FAIL: Failed to get order history:', myOrdersRes.status, myOrders);
    process.exit(1);
  }

  // 8. Get Order Details
  console.log('\n8. Testing Order Details endpoint for Shopper A...');
  const detailsRes = await fetch(`${API_BASE}/orders/${orderId}`, {
    headers: { 'Cookie': shopperACookie }
  });
  const details = await detailsRes.json();
  if (detailsRes.status === 200 && details._id === orderId && details.shippingAddress.address === '123 Main St') {
    console.log('PASS: Order details retrieved successfully for owner.');
  } else {
    console.error('FAIL: Order details retrieval failed:', detailsRes.status, details);
    process.exit(1);
  }

  // 9. Register Shopper B & test Authorization Barrier
  console.log('\n9. Registering Shopper B and testing unauthorized access...');
  const shopperBRegisterRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Shopper B',
      email: shopperBEmail,
      password: 'password123',
      role: 'user'
    })
  });
  const shopperBCookie = getJwtCookie(shopperBRegisterRes);
  if (!shopperBCookie) {
    console.error('Failed to get Shopper B cookie');
    process.exit(1);
  }

  const unauthorizedRes = await fetch(`${API_BASE}/orders/${orderId}`, {
    headers: { 'Cookie': shopperBCookie }
  });
  if (unauthorizedRes.status === 403) {
    console.log('PASS: Unauthorized access correctly blocked (403 Forbidden).');
  } else {
    console.error('FAIL: Expected 403 Forbidden but got:', unauthorizedRes.status);
    process.exit(1);
  }

  // 10. Test Checkout with Empty Cart (Shopper B)
  console.log('\n10. Testing checkout with empty cart...');
  const emptyCheckoutRes = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': shopperBCookie },
    body: JSON.stringify({ shippingAddress })
  });
  const emptyBody = await emptyCheckoutRes.json();
  if (emptyCheckoutRes.status === 400 && emptyBody.message && emptyBody.message.includes('empty')) {
    console.log(`PASS: Empty cart checkout rejected: "${emptyBody.message}"`);
  } else {
    console.error('FAIL: Expected empty cart rejection but got:', emptyCheckoutRes.status, emptyBody);
    process.exit(1);
  }

  // 11. Test Checkout with Insufficient Stock (Shopper B adds 8 units, stock is 7)
  console.log('\n11. Testing checkout with insufficient stock (Adding 8 units, stock is 7)...');
  // First add 8 to cart (Cart addItemToCart validates stock before adding, but let's test if order controller validates stock too)
  // Let's modify product stock directly in DB to 5 to trigger order controller validation if item is added or cart contains it
  await mongoose.connect(process.env.MONGO_URI);
  const dbProduct = await Product.findById(product._id);
  dbProduct.stock = 5;
  await dbProduct.save();
  await mongoose.disconnect();
  console.log('Set product stock to 5 in DB.');

  // Add 4 items to cart (fits stock 5)
  await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': shopperBCookie },
    body: JSON.stringify({ productId: product._id, quantity: 4 })
  });

  // Now, modify product stock directly in DB to 2 (so the cart item quantity 4 exceeds stock 2)
  await mongoose.connect(process.env.MONGO_URI);
  const dbProduct2 = await Product.findById(product._id);
  dbProduct2.stock = 2;
  await dbProduct2.save();
  await mongoose.disconnect();
  console.log('Set product stock to 2 in DB directly (shopper cart quantity is 4).');

  // Attempt checkout, should fail due to stock violation in checkout logic
  const stockCheckoutRes = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': shopperBCookie },
    body: JSON.stringify({ shippingAddress })
  });
  const stockBody = await stockCheckoutRes.json();
  if (stockCheckoutRes.status === 400 && stockBody.message && stockBody.message.includes('stock')) {
    console.log(`PASS: Insufficient stock checkout rejected: "${stockBody.message}"`);
  } else {
    console.error('FAIL: Expected stock validation failure in checkout but got:', stockCheckoutRes.status, stockBody);
    process.exit(1);
  }

  console.log('\n======================================');
  console.log('ALL ORDER INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('======================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
