const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
require('dotenv').config();

// Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CodeAlpha E-commerce API' });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Product Routes
app.use('/api/products', productRoutes);

// Cart Routes
app.use('/api/cart', cartRoutes);

// Order Routes
app.use('/api/orders', orderRoutes);

// Test error route
app.get('/api/test-error', (req, res, next) => {
  const error = new Error('Test error handling middleware');
  res.status(500);
  next(error);
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
