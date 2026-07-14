const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Helper to calculate total price
const calculateTotalPrice = (items) => {
  let total = 0;
  for (const item of items) {
    total += item.product.price * item.quantity;
  }
  return parseFloat(total.toFixed(2));
};

// @desc    Create new order (Checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'Cash on Delivery' } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      res.status(400);
      return next(new Error('Please provide complete shipping address details (address, city, postalCode, country)'));
    }

    // Retrieve cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      res.status(400);
      return next(new Error('Your cart is empty'));
    }

    // Validate stock for all items first
    for (const item of cart.items) {
      if (!item.product) {
        res.status(404);
        return next(new Error('One or more products in your cart do not exist anymore'));
      }
      if (item.quantity > item.product.stock) {
        res.status(400);
        return next(new Error(`Insufficient stock for "${item.product.name}". Available: ${item.product.stock}, requested: ${item.quantity}`));
      }
    }

    // Map cart items to order items
    const orderItems = cart.items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      image: item.product.image,
      price: item.product.price,
      product: item.product._id
    }));

    const totalPrice = calculateTotalPrice(cart.items);

    // Deduct stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      product.stock -= item.quantity;
      await product.save();
    }

    // Create Order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice
    });

    const createdOrder = await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders (Order History)
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID (Order Details)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    // Authorize: user who placed the order or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Not authorized to view this order'));
    }

    res.json(order);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404);
      return next(new Error('Order not found'));
    }
    next(error);
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    // Only order owner or admin can pay
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Not authorized to pay for this order'));
    }

    order.isPaid = true;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404);
      return next(new Error('Order not found'));
    }
    next(error);
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404);
      return next(new Error('Order not found'));
    }
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered
};
