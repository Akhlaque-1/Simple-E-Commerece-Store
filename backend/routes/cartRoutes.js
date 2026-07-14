const express = require('express');
const router = express.Router();
const {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Mount protect middleware on all cart routes
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addItemToCart)
  .delete(clearCart);

router.route('/:productId')
  .put(updateCartItemQuantity)
  .delete(removeItemFromCart);

module.exports = router;
