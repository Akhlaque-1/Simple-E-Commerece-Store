const mongoose = require('mongoose');
const User = require('../models/userModel');
const Product = require('../models/productModel');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

// Helper function to extract JWT cookie from response
function getJwtCookie(res) {
  const rawCookies = res.headers.get('set-cookie');
  if (!rawCookies) return null;
  // Look for jwt=xxxx;
  const match = rawCookies.match(/jwt=([^;]+)/);
  return match ? `jwt=${match[1]}` : null;
}

async function runTests() {
  console.log('Connecting to database for test setup/cleanup...');
  await mongoose.connect(process.env.MONGO_URI);
  
  // Clean up existing test data
  const adminEmail = 'test_admin@test.com';
  const userEmail = 'test_user@test.com';
  await User.deleteMany({ email: { $in: [adminEmail, userEmail] } });
  await Product.deleteMany({ name: { $regex: /^Test Product/ } });
  console.log('Test setup/cleanup done.');
  await mongoose.disconnect();

  console.log('\n--- Starting Integration Tests ---\n');

  // 1. Register Admin User
  console.log('1. Registering Admin user...');
  const adminRegisterRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Admin',
      email: adminEmail,
      password: 'password123',
      role: 'admin'
    })
  });
  const adminData = await adminRegisterRes.json();
  const adminCookie = getJwtCookie(adminRegisterRes);
  if (adminRegisterRes.status !== 201 || !adminCookie) {
    console.error('Failed to register Admin user:', adminData);
    process.exit(1);
  }
  console.log('Admin registered. Cookie:', adminCookie);

  // 2. Register Regular User
  console.log('\n2. Registering Regular user...');
  const userRegisterRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: userEmail,
      password: 'password123',
      role: 'user'
    })
  });
  const userData = await userRegisterRes.json();
  const userCookie = getJwtCookie(userRegisterRes);
  if (userRegisterRes.status !== 201 || !userCookie) {
    console.error('Failed to register Regular user:', userData);
    process.exit(1);
  }
  console.log('Regular user registered. Cookie:', userCookie);

  // 3. Test Product Input Validation (Admin)
  console.log('\n3. Testing Product Input Validation (Admin)...');
  const invalidProducts = [
    {
      data: { name: 'Test Product', description: 'Desc', price: -10, image: 'http://example.com/img.jpg', category: 'Cat', stock: 10 },
      expectedError: 'Price must be a positive number'
    },
    {
      data: { name: 'Test Product', description: 'Desc', price: 100, image: 'http://example.com/img.jpg', category: 'Cat', stock: -5 },
      expectedError: 'Stock must be a non-negative integer'
    },
    {
      data: { name: 'Test Product', description: 'Desc', price: 100, image: 'invalid-image-url', category: 'Cat', stock: 10 },
      expectedError: 'Please provide a valid image URL'
    },
    {
      data: { name: 'Test Product', price: 100, image: 'http://example.com/img.jpg', category: 'Cat', stock: 10 },
      expectedError: 'Please fill in all fields'
    }
  ];

  for (const item of invalidProducts) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookie
      },
      body: JSON.stringify(item.data)
    });
    const body = await res.json();
    if (res.status === 400 && body.message && body.message.includes(item.expectedError)) {
      console.log(`PASS: Validation rejected as expected: "${body.message}"`);
    } else {
      console.error(`FAIL: Expected validation error containing "${item.expectedError}" but got:`, res.status, body);
      process.exit(1);
    }
  }

  // 4. Test Create Product - Regular User (should be forbidden)
  console.log('\n4. Testing Create Product as Regular User...');
  const createProductData = {
    name: 'Test Product Regular',
    description: 'A test product created by regular user',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    category: 'Electronics',
    stock: 50
  };

  const regularCreateRes = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': userCookie
    },
    body: JSON.stringify(createProductData)
  });
  const regularCreateBody = await regularCreateRes.json();
  if (regularCreateRes.status === 403) {
    console.log('PASS: Regular user creation blocked (403 Forbidden).');
  } else {
    console.error('FAIL: Expected 403 Forbidden but got:', regularCreateRes.status, regularCreateBody);
    process.exit(1);
  }

  // 5. Test Create Product - Admin User (should succeed)
  console.log('\n5. Testing Create Product as Admin...');
  const adminCreateProductData = {
    name: 'Test Product Admin 1',
    description: 'High-quality test headphones',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    category: 'Audio',
    stock: 100
  };

  const adminCreateRes = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookie
    },
    body: JSON.stringify(adminCreateProductData)
  });
  const createdProduct = await adminCreateRes.json();
  if (adminCreateRes.status === 201 && createdProduct._id) {
    console.log('PASS: Product created successfully:', createdProduct._id, createdProduct.name);
  } else {
    console.error('FAIL: Product creation failed:', adminCreateRes.status, createdProduct);
    process.exit(1);
  }

  const productId = createdProduct._id;

  // 6. Test Public GET Products & Product by ID
  console.log('\n6. Testing Public access to Product endpoints...');
  const getProductsRes = await fetch(`${API_BASE}/products`);
  const productsList = await getProductsRes.json();
  if (getProductsRes.status === 200 && Array.isArray(productsList) && productsList.length > 0) {
    console.log(`PASS: GET /products returned ${productsList.length} products.`);
  } else {
    console.error('FAIL: GET /products failed:', getProductsRes.status, productsList);
    process.exit(1);
  }

  const getProductByIdRes = await fetch(`${API_BASE}/products/${productId}`);
  const productDetails = await getProductByIdRes.json();
  if (getProductByIdRes.status === 200 && productDetails._id === productId) {
    console.log('PASS: GET /products/:id returned correct product:', productDetails.name);
  } else {
    console.error('FAIL: GET /products/:id failed:', getProductByIdRes.status, productDetails);
    process.exit(1);
  }

  // 7. Test Update Product - Regular User (should be forbidden)
  console.log('\n7. Testing Update Product as Regular User...');
  const regularUpdateRes = await fetch(`${API_BASE}/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': userCookie
    },
    body: JSON.stringify({ price: 120.00 })
  });
  if (regularUpdateRes.status === 403) {
    console.log('PASS: Regular user update blocked (403 Forbidden).');
  } else {
    console.error('FAIL: Expected 403 Forbidden but got:', regularUpdateRes.status);
    process.exit(1);
  }

  // 8. Test Update Product - Admin User (should succeed)
  console.log('\n8. Testing Update Product as Admin...');
  const adminUpdateRes = await fetch(`${API_BASE}/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': adminCookie
    },
    body: JSON.stringify({
      price: 129.99,
      stock: 85
    })
  });
  const updatedProductDetails = await adminUpdateRes.json();
  if (adminUpdateRes.status === 200 && updatedProductDetails.price === 129.99 && updatedProductDetails.stock === 85) {
    console.log('PASS: Product updated successfully. New Price:', updatedProductDetails.price, 'New Stock:', updatedProductDetails.stock);
  } else {
    console.error('FAIL: Product update failed:', adminUpdateRes.status, updatedProductDetails);
    process.exit(1);
  }

  // 9. Test Delete Product - Regular User (should be forbidden)
  console.log('\n9. Testing Delete Product as Regular User...');
  const regularDeleteRes = await fetch(`${API_BASE}/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Cookie': userCookie
    }
  });
  if (regularDeleteRes.status === 403) {
    console.log('PASS: Regular user deletion blocked (403 Forbidden).');
  } else {
    console.error('FAIL: Expected 403 Forbidden but got:', regularDeleteRes.status);
    process.exit(1);
  }

  // 10. Test Delete Product - Admin User (should succeed)
  console.log('\n10. Testing Delete Product as Admin...');
  const adminDeleteRes = await fetch(`${API_BASE}/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Cookie': adminCookie
    }
  });
  const deleteBody = await adminDeleteRes.json();
  if (adminDeleteRes.status === 200 && deleteBody.message === 'Product removed successfully') {
    console.log('PASS: Product deleted successfully by Admin.');
  } else {
    console.error('FAIL: Product deletion failed:', adminDeleteRes.status, deleteBody);
    process.exit(1);
  }

  // 11. Verify Deleted Product is not found
  console.log('\n11. Verifying deleted product is not found...');
  const getDeletedRes = await fetch(`${API_BASE}/products/${productId}`);
  if (getDeletedRes.status === 404) {
    console.log('PASS: Deleted product GET request returned 404 Not Found.');
  } else {
    console.error('FAIL: Expected 404 Not Found for deleted product but got:', getDeletedRes.status);
    process.exit(1);
  }

  console.log('\n======================================');
  console.log('ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('======================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
