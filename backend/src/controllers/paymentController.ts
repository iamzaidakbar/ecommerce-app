import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { Order } from '../models/Order';
import { AppError } from '../middleware/errorHandler';
import env from '../config/env';
import sendEmail from '../config/email';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentStatus === 'paid') {
      throw new AppError('Order is already paid', 400);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: order.user._id.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent
    order.paymentDetails = {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
    };
    await order.save();

    res.status(200).json({
      status: 'success',
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      throw new AppError('No Stripe signature found', 400);
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig || '',
      env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          status: 'processing',
          'paymentDetails.paymentIntentId': paymentIntent.id,
          'paymentDetails.paymentMethod': paymentIntent.payment_method_types[0],
          'paymentDetails.paidAt': new Date(),
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'failed',
          'paymentDetails.error': paymentIntent.last_payment_error?.message,
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const orderId = charge.metadata?.orderId;

        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'refunded',
          status: 'cancelled',
          'paymentDetails.refundStatus': 'completed',
          'paymentDetails.refundedAt': new Date(),
        });
        break;
      }

      case 'charge.refund.updated': {
        const refund = event.data.object as Stripe.Refund;
        const orderId = refund.metadata?.orderId;

        await Order.findByIdAndUpdate(orderId, {
          'paymentDetails.refundStatus': refund.status,
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).select('paymentStatus paymentDetails');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        paymentStatus: order.paymentStatus,
        clientSecret: order.paymentDetails?.clientSecret,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentStatus !== 'paid') {
      throw new AppError('Order is not paid', 400);
    }

    const paymentIntentId = order.paymentDetails?.paymentIntentId;
    if (!paymentIntentId) {
      throw new AppError('Payment details not found', 400);
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      metadata: {
        orderId: order._id.toString(),
        reason: reason || 'customer_requested',
      },
    });

    // Update order status
    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    order.paymentDetails = {
      ...order.paymentDetails,
      refundId: refund.id,
      refundedAt: new Date(),
      refundReason: reason,
    };
    await order.save();

    // Send refund confirmation email
    await sendEmail({
      email: req.user.email,
      subject: 'Refund Processed',
      html: `
        <h1>Refund Processed Successfully</h1>
        <p>Your refund for order #${order._id} has been processed.</p>
        <p>Amount refunded: $${order.totalAmount}</p>
        <p>Refund ID: ${refund.id}</p>
        <p>The amount will be credited to your original payment method within 5-10 business days.</p>
      `,
    });

    res.status(200).json({
      status: 'success',
      data: {
        refund,
        order,
      },
    });
  } catch (error) {
    next(error);
  }
}; 