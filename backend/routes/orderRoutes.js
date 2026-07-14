const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Mount protect middleware on all order routes
router.use(protect);

router.route('/')
  .post(createOrder);

router.route('/myorders')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/pay')
  .put(updateOrderToPaid);

router.route('/:id/deliver')
  .put(admin, updateOrderToDelivered);

module.exports = router;
