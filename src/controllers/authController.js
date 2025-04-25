import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../middleware/errorHandler.js";
import prisma from "../models/prisma.js";
import config from "../config/config.js";

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

// Generate refresh token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
};

// Create and send tokens
const createSendTokens = (user, statusCode, res) => {
  const token = signToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  // Remove password from output
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;

  res.status(statusCode).json({
    status: "success",
    token,
    refreshToken,
    data: {
      user: userWithoutPassword,
    },
  });
};

// Register a new user
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new AppError("Email already in use", 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        role: "USER",
      },
    });

    // Create cart for the user
    await prisma.cart.create({
      data: {
        userId: newUser.id,
      },
    });

    createSendTokens(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // Check if user exists && password is correct
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // If everything ok, send token to client
    createSendTokens(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Logout user (client-side)
export const logout = (req, res) => {
  res.status(200).json({ status: "success" });
};

// Get current user
export const getMe = async (req, res, next) => {
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

// Request password reset
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new AppError("No user found with that email address", 404));
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Save it to the database with an expiry
    // 3. Send an email with a reset link

    // For this example, we'll just acknowledge the request
    res.status(200).json({
      status: "success",
      message: "Password reset instructions sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

// Update password
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Check if current password is correct
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return next(new AppError("Your current password is incorrect", 401));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
      },
    });

    // Log user in with new token
    createSendTokens(updatedUser, 200, res);
  } catch (error) {
    next(error);
  }
};
