import { AppError } from "../middleware/errorHandler.js";
import { createPayment, handlePaymentNotification, checkPaymentStatus } from "../services/paymentServices.js";
import prisma from "../models/prisma.js";
import logger from "../utils/logger.js";

// Create payment intent
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    // Check if order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (order.userId !== req.user.id) {
      return next(new AppError("You do not have permission to pay for this order", 403));
    }

    // Create payment intent
    const paymentIntent = await createPayment(order);

    res.status(200).json({
      status: "success",
      data: {
        paymentIntent,
      },
    });
  } catch (error) {
    logger.error("Error creating payment intent:", error);
    next(error);
  }
};

// Payment webhook
export const paymentWebhook = async (req, res, next) => {
  try {
    const notification = req.body;

    logger.info("Payment webhook received:", notification);

    // Handle payment notification
    const result = await handlePaymentNotification(notification);

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error processing payment webhook:", error);
    next(error);
  }
};

// Check payment status
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
      return next(new AppError("You do not have permission to check this payment", 403));
    }

    // Check payment status
    const status = await checkPaymentStatus(orderId);

    res.status(200).json({
      status: "success",
      data: status,
    });
  } catch (error) {
    logger.error("Error checking payment status:", error);
    next(error);
  }
};
