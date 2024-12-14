import express from 'express';
import { body } from 'express-validator';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

router.use(requireAuth);

router.post(
  '/',
  [
    body('productId')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ],
  validateRequest,
  addToCart as any
);

router.get('/', getCart as any);

router.put(
  '/',
  [
    body('productId')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('quantity')
      .isInt({ min: 0 })
      .withMessage('Quantity must be 0 or greater'),
  ],
  validateRequest,
  updateCartItem as any
);

router.delete('/clear', clearCart as any);
router.delete('/:productId', removeFromCart as any);

export default router; 