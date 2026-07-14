const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Helper function to calculate total price of a populated cart
const calculateTotalPrice = (cart) => {
  let total = 0;
  if (cart && cart.items) {
    for (const item of cart.items) {
      if (item.product) {
        total += item.product.price * item.quantity;
      }
    }
  }
  return parseFloat(total.toFixed(2));
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({
      _id: cart._id,
      user: cart.user,
      items: cart.items,
      totalPrice: calculateTotalPrice(cart),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addItemToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400);
      return next(new Error('Product ID is required'));
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty < 1 || !Number.isInteger(numQty)) {
      res.status(400);
      return next(new Error('Quantity must be a positive integer'));
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product is already in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    let targetQty = numQty;
    if (itemIndex > -1) {
      targetQty += cart.items[itemIndex].quantity;
    }

    // Stock check
    if (targetQty > product.stock) {
      res.status(400);
      return next(new Error(`Cannot add items. Only ${product.stock} items are available in stock (you already have ${itemIndex > -1 ? cart.items[itemIndex].quantity : 0} in cart)`));
    }

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = targetQty;
    } else {
      cart.items.push({ product: productId, quantity: numQty });
    }

    await cart.save();
    
    // Fetch populated cart to calculate total price
    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.json({
      _id: populatedCart._id,
      user: populatedCart.user,
      items: populatedCart.items,
      totalPrice: calculateTotalPrice(populatedCart)
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404);
      return next(new Error('Product not found'));
    }
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      res.status(400);
      return next(new Error('Quantity is required'));
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty < 1 || !Number.isInteger(numQty)) {
      res.status(400);
      return next(new Error('Quantity must be a positive integer'));
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    if (numQty > product.stock) {
      res.status(400);
      return next(new Error(`Cannot update quantity. Only ${product.stock} items are available in stock`));
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      return next(new Error('Cart not found'));
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      res.status(404);
      return next(new Error('Product not found in cart'));
    }

    cart.items[itemIndex].quantity = numQty;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.json({
      _id: populatedCart._id,
      user: populatedCart.user,
      items: populatedCart.items,
      totalPrice: calculateTotalPrice(populatedCart)
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404);
      return next(new Error('Product not found'));
    }
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeItemFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      return next(new Error('Cart not found'));
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      res.status(404);
      return next(new Error('Product not found in cart'));
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.json({
      _id: populatedCart._id,
      user: populatedCart.user,
      items: populatedCart.items,
      totalPrice: calculateTotalPrice(populatedCart)
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404);
      return next(new Error('Product not found'));
    }
    next(error);
  }
};

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      return next(new Error('Cart not found'));
    }

    cart.items = [];
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.json({
      _id: populatedCart._id,
      user: populatedCart.user,
      items: populatedCart.items,
      totalPrice: calculateTotalPrice(populatedCart)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCart
};
