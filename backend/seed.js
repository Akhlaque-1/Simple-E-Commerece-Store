const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const Product = require('./models/productModel');

// Load environment variables
dotenv.config();

const products = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    price: 199.99,
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
    category: 'Electronics',
    stock: 15
  },
  {
    name: 'Ergonomic Office Chair',
    price: 249.99,
    description: 'Adjustable lumbar support, 3D armrests, and breathable mesh back designed to keep you comfortable during long working hours.',
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop',
    category: 'Furniture',
    stock: 8
  },
  {
    name: 'Smart Watch Series 5',
    price: 299.99,
    description: 'Stay connected with fitness tracking, heart rate monitor, sleep tracking, and built-in GPS with a sleek modern design.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
    category: 'Electronics',
    stock: 20
  },
  {
    name: 'Mechanical Gaming Keyboard',
    price: 89.99,
    description: 'RGB backlit mechanical keyboard with tactile blue switches, anti-ghosting keys, and durable aluminum top frame.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop',
    category: 'Electronics',
    stock: 12
  },
  {
    name: 'Portable Bluetooth Speaker',
    price: 59.99,
    description: 'Waterproof portable speaker with rich bass, 360-degree sound, and up to 12 hours of playtime on a single charge.',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop',
    category: 'Electronics',
    stock: 25
  },
  {
    name: 'Ultra HD Action Camera',
    price: 129.99,
    description: 'Capture your adventures in 4K resolution. Waterproof up to 30 meters with wide-angle lens and image stabilization.',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop',
    category: 'Camera',
    stock: 10
  },
  {
    name: 'Minimalist Leather Wallet',
    price: 39.99,
    description: 'Genuine top-grain leather wallet featuring RFID blocking technology, 6 card slots, and a slim profile for front pocket carry.',
    image: 'https://images.unsplash.com/photo-1627124765135-56a300131ea4?w=800&auto=format&fit=crop',
    category: 'Fashion',
    stock: 30
  },
  {
    name: 'Stainless Steel Water Bottle',
    price: 24.99,
    description: 'Double-walled vacuum insulated water bottle keeps drinks cold for 24 hours or hot for 12 hours. Leak-proof cap.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop',
    category: 'Fitness',
    stock: 50
  }
];

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI environment variable is missing.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connection successful.');

    // 1. Ensure Admin User exists
    let adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      console.log('No admin user found. Creating automatic admin user...');
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@example.com',
        password: 'admin123password',
        role: 'admin'
      });
      console.log('Admin user created successfully:');
      console.log('  Email: admin@example.com');
      console.log('  Password: admin123password');
    } else {
      console.log(`Using existing admin user: ${adminUser.email}`);
    }

    // 2. Clear Existing Products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Existing products cleared.');

    // 3. Seed Products associated with the Admin User
    const productsWithAdmin = products.map((product) => ({
      ...product,
      user: adminUser._id
    }));

    console.log(`Seeding ${productsWithAdmin.length} products...`);
    const createdProducts = await Product.insertMany(productsWithAdmin);
    console.log('Products seeded successfully!');
    console.log(createdProducts.map(p => `  - ${p.name} ($${p.price})`).join('\n'));

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
