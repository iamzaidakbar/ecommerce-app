import { Response, NextFunction } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { AppError } from '../middleware/errorHandler';
import { RequestWithUser } from '../middleware/auth';

export const addToCart = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check product availability
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (!product.isActive) {
      throw new AppError('Product is not available', 400);
    }

    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} items available`, 400);
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalAmount: 0,
      });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      // Update quantity if product exists
      if (product.stock < existingItem.quantity + quantity) {
        throw new AppError(`Only ${product.stock} items available`, 400);
      }
      existingItem.quantity += quantity;
      existingItem.price = product.price;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    // Populate product details
    await cart.populate('items.product');

    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const getCart = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      return res.status(200).json({
        status: 'success',
        data: {
          cart: {
            items: [],
            totalAmount: 0,
          },
        },
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 0) {
      throw new AppError('Quantity cannot be negative', 400);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const cartItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!cartItem) {
      throw new AppError('Item not found in cart', 404);
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} items available`, 400);
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items = cart.items.filter(
        item => item.product.toString() !== productId
      );
    } else {
      cartItem.quantity = quantity;
      cartItem.price = product.price; // Update price in case it changed
    }

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );
    await cart.save();

    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    next(error);
  }
}; 