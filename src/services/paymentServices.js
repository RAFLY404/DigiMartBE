import midtransClient from "midtrans-client";
import config from "../config/config.js";
import prisma from "../models/prisma.js";
import logger from "../utils/logger.js";

// Create Midtrans Snap API instance
const snap = new midtransClient.Snap({
  isProduction: config.midtrans.isProduction,
  serverKey: config.midtrans.serverKey,
  clientKey: config.midtrans.clientKey,
});

// Create payment intent
export const createPayment = async (order) => {
  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: order.userId },
    });

    // Create transaction parameter
    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: Number.parseInt(order.total),
      },
      customer_details: {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone,
        billing_address: order.shippingAddress,
        shipping_address: order.shippingAddress,
      },
      item_details: order.items.map((item) => ({
        id: item.productId.toString(),
        price: Number.parseInt(item.price),
        quantity: item.quantity,
        name: item.productName,
      })),
    };

    // Create transaction
    const transaction = await snap.createTransaction(parameter);

    return {
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    };
  } catch (error) {
    logger.error("Error creating payment:", error);
    throw error;
  }
};

// Handle payment notification
export const handlePaymentNotification = async (notification) => {
  try {
    const statusResponse = await snap.transaction.notification(notification);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    logger.info(`Payment notification received for order ${orderId}: ${transactionStatus}`);

    let paymentStatus;
    let orderStatus;

    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        paymentStatus = "PENDING";
      } else if (fraudStatus === "accept") {
        paymentStatus = "PAID";
        orderStatus = "PROCESSING";
      }
    } else if (transactionStatus === "settlement") {
      paymentStatus = "PAID";
      orderStatus = "PROCESSING";
    } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
      paymentStatus = "FAILED";
      orderStatus = "CANCELLED";
    } else if (transactionStatus === "pending") {
      paymentStatus = "PENDING";
    }

    // Update order payment status
    if (paymentStatus) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus,
          ...(orderStatus && { status: orderStatus }),
        },
      });
    }

    return {
      success: true,
      message: "Payment notification processed",
    };
  } catch (error) {
    logger.error("Error handling payment notification:", error);
    throw error;
  }
};

// Check payment status
export const checkPaymentStatus = async (orderId) => {
  try {
    const statusResponse = await snap.transaction.status(orderId);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let paymentStatus;
    let orderStatus;

    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        paymentStatus = "PENDING";
      } else if (fraudStatus === "accept") {
        paymentStatus = "PAID";
        orderStatus = "PROCESSING";
      }
    } else if (transactionStatus === "settlement") {
      paymentStatus = "PAID";
      orderStatus = "PROCESSING";
    } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
      paymentStatus = "FAILED";
      orderStatus = "CANCELLED";
    } else if (transactionStatus === "pending") {
      paymentStatus = "PENDING";
    }

    // Update order payment status
    if (paymentStatus) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus,
          ...(orderStatus && { status: orderStatus }),
        },
      });
    }

    return {
      success: true,
      paymentStatus,
      transactionStatus,
    };
  } catch (error) {
    logger.error("Error checking payment status:", error);
    throw error;
  }
};
