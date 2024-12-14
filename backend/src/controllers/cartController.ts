import { Request, Response, NextFunction } from 'express';
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
    const { productId, quantity } = req.body;

    // Check product availability
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.stock < quantity) {
      throw new AppError('Insufficient stock', 400);
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
    const cartItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.price = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

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
) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product'
    );

    res.status(200).json({
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
      throw new AppError('Insufficient stock', 400);
    }

    cartItem.quantity = quantity;
    await cart.save();

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