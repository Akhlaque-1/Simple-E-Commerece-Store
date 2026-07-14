const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a product description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  image: {
    type: String,
    required: [true, 'Please add a product image URL']
  },
  category: {
    type: String,
    required: [true, 'Please add a product category'],
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Please add product stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
