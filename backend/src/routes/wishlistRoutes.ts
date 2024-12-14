import { Router } from 'express';
import { body } from 'express-validator';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  [
    body('productId').isMongoId().withMessage('Invalid product ID'),
  ],
  validateRequest,
  addToWishlist as any
);

router.get('/', getWishlist as any);
router.delete('/:productId', removeFromWishlist as any);

export default router; 