import express from 'express';
import { body } from 'express-validator';
import {
  createPaymentIntent,
  handleWebhook,
  getPaymentStatus,
  refundPayment,
} from '../controllers/paymentController';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Webhook route (no auth needed)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Protected routes
router.use(requireAuth);

router.post(
  '/create-payment-intent',
  [
    body('orderId')
      .isMongoId()
      .withMessage('Invalid order ID'),
  ],
  validateRequest,
  createPaymentIntent
);

router.get('/status/:orderId', getPaymentStatus);

router.post(
  '/refund/:orderId',
  [
    body('reason')
      .optional()
      .isString()
      .withMessage('Reason must be a string'),
  ],
  validateRequest,
  refundPayment
);

export default router; 