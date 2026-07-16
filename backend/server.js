const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Connect Database (pre-initialize connection pool on cold start)
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection middleware (guarantees DB is ready before routes execute)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CodeAlpha E-commerce API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Test Route
app.get('/api/test-error', (req, res, next) => {
  const error = new Error('Test error');
  next(error);
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start Server (only for direct local execution)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export Express app for Vercel
module.exports = app;
