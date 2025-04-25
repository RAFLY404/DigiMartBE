import prisma from "../models/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { createPayment } from "../services/paymentServices.js";

// Create new order
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddressId, paymentMethod, shippingFee = 10.0 } = req.body;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return next(new AppError("Cart is empty", 400));
    }

    // Get shipping address
    const shippingAddress = await prisma.address.findUnique({
      where: { id: shippingAddressId },
    });

    if (!shippingAddress || shippingAddress.userId !== req.user.id) {
      return next(new AppError("Invalid shipping address", 400));
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

    // Calculate total
    const total = subtotal + Number(shippingFee);

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        subtotal,
        shipping: shippingFee,
        total,
        status: "PROCESSING",
        shippingAddress: {
          name: shippingAddress.name,
          address: shippingAddress.address,
          city: shippingAddress.city,
          zipCode: shippingAddress.zipCode,
        },
        paymentMethod,
        paymentStatus: "PENDING",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productImage: item.product.image,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update product stock
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Create payment intent
    const paymentIntent = await createPayment(order);

    res.status(201).json({
      status: "success",
      data: {
        order,
        payment: paymentIntent,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user's orders
export const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = Number.parseInt(page, 10);
    const limitNumber = Number.parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limitNumber,
    });

    // Get total count for pagination
    const total = await prisma.order.count({
      where: { userId: req.user.id },
    });

    res.status(200).json({
      status: "success",
      data: {
        orders,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get order details
export const getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Check if order belongs to user or user is admin
    if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
      return next(new AppError("You do not have permission to view this order", 403));
    }

    res.status(200).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Check if order belongs to user
    if (order.userId !== req.user.id) {
      return next(new AppError("You do not have permission to cancel this order", 403));
    }

    // Check if order can be cancelled
    if (order.status !== "PROCESSING") {
      return next(new AppError("Order cannot be cancelled", 400));
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};
