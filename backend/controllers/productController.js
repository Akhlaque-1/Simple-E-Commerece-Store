const Product = require('../models/productModel');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate('user', 'name email');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('user', 'name email');

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      return next(new Error('Product not found'));
    }
  } catch (error) {
    // If invalid MongoDB ObjectId format, return 404
    if (error.kind === 'ObjectId') {
      res.status(404);
      return next(new Error('Product not found'));
    }
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    // Basic required validation
    if (!name || !description || price === undefined || !image || !category || stock === undefined) {
      res.status(400);
      return next(new Error('Please fill in all fields (name, description, price, image, category, stock)'));
    }

    // Number validation
    const numPrice = Number(price);
    const numStock = Number(stock);

    if (isNaN(numPrice) || numPrice < 0) {
      res.status(400);
      return next(new Error('Price must be a positive number'));
    }

    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      res.status(400);
      return next(new Error('Stock must be a non-negative integer'));
    }

    // URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    // We can also allow relative path/standard URLs
    if (!urlPattern.test(image) && !image.startsWith('http://') && !image.startsWith('https://') && !image.startsWith('/')) {
      res.status(400);
      return next(new Error('Please provide a valid image URL (should start with http/https or /)'));
    }

    const product = new Product({
      user: req.user._id,
      name,
      description,
      price: numPrice,
      image,
      category,
      stock: numStock
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    // Update fields if provided
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        res.status(400);
        return next(new Error('Price must be a positive number'));
      }
      product.price = numPrice;
    }

    if (stock !== undefined) {
      const numStock = Number(stock);
      if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
        res.status(400);
        return next(new Error('Stock must be a non-negative integer'));
      }
      product.stock = numStock;
    }

    if (image !== undefined) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
      if (!urlPattern.test(image) && !image.startsWith('http://') && !image.startsWith('https://') && !image.startsWith('/')) {
        res.status(400);
        return next(new Error('Please provide a valid image URL (should start with http/https or /)'));
      }
      product.image = image;
    }

    // Keep track of the admin who last updated it
    product.user = req.user._id;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404);
      return next(new Error('Product not found'));
    }
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404);
      return next(new Error('Product not found'));
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(404);
      return next(new Error('Product not found'));
    }
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
