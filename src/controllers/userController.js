import prisma from "../models/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

// Get user profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user addresses
export const getUserAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: {
        addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add new address
export const addAddress = async (req, res, next) => {
  try {
    const { name, address, city, zipCode, isDefault } = req.body;

    // If this address is set as default, update all other addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: req.user.id,
        name,
        address,
        city,
        zipCode,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        address: newAddress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update address
export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address, city, zipCode, isDefault } = req.body;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      return next(new AppError("Address not found", 404));
    }

    if (existingAddress.userId !== req.user.id) {
      return next(new AppError("You do not have permission to update this address", 403));
    }

    // If this address is set as default, update all other addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: req.user.id,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        name,
        address,
        city,
        zipCode,
        isDefault: isDefault || false,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        address: updatedAddress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete address
export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      return next(new AppError("Address not found", 404));
    }

    if (existingAddress.userId !== req.user.id) {
      return next(new AppError("You do not have permission to delete this address", 403));
    }

    await prisma.address.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Get payment methods
export const getPaymentMethods = async (req, res, next) => {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: {
        paymentMethods,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add payment method
export const addPaymentMethod = async (req, res, next) => {
  try {
    const { type, details, isDefault } = req.body;

    // If this payment method is set as default, update all other payment methods
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const newPaymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: req.user.id,
        type,
        details,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        paymentMethod: newPaymentMethod,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete payment method
export const deletePaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if payment method exists and belongs to user
    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!existingPaymentMethod) {
      return next(new AppError("Payment method not found", 404));
    }

    if (existingPaymentMethod.userId !== req.user.id) {
      return next(new AppError("You do not have permission to delete this payment method", 403));
    }

    await prisma.paymentMethod.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
