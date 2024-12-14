import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Protected routes (authenticated users)
router.use(requireAuth as any);

router.post(
  '/',
  [
    body('items')
      .isArray()
      .withMessage('Items must be an array')
      .notEmpty()
      .withMessage('Order must contain at least one item'),
    body('items.*.product')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('shippingAddress')
      .isObject()
      .withMessage('Shipping address is required'),
    body('paymentMethod')
      .notEmpty()
      .withMessage('Payment method is required'),
  ],
  validateRequest,
  createOrder as any
);

// Get user's orders
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);

// Admin routes
router.put(
  '/:id/status',
  requireAdmin,
  [
    body('status')
      .isIn(['processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),
  ],
  validateRequest,
  updateOrderStatus
);

export default router;
