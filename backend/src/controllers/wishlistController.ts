import { Response, NextFunction } from 'express';
import { Wishlist } from '../models/Wishlist';
import { AppError } from '../middleware/errorHandler';
import { RequestWithUser } from '../middleware/auth';

export const addToWishlist = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    res.status(200).json({
      status: 'success',
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products');

    res.status(200).json({
      status: 'success',
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      throw new AppError('Wishlist not found', 404);
    }

    wishlist.products = wishlist.products.filter(
      id => id.toString() !== productId
    );
    await wishlist.save();

    res.status(200).json({
      status: 'success',
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
}; 