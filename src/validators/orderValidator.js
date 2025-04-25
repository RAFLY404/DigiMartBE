import { body, validationResult } from "express-validator";
import { AppError } from "../middleware/errorHandler.js";

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new AppError(errorMessages[0], 400));
  }
  next();
};

// Validate order
export const validateOrder = [
  body("shippingAddressId")
    .trim()
    .notEmpty()
    .withMessage("Shipping address ID is required")
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)
    .withMessage("Shipping address ID must be a valid UUID"),

  body("paymentMethod").trim().notEmpty().withMessage("Payment method is required"),

  body("shippingFee").optional().isFloat({ min: 0 }).withMessage("Shipping fee must be a positive number"),

  validate,
];

// Validate order status update
export const validateOrderStatus = [body("status").trim().notEmpty().withMessage("Status is required").isIn(["PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"]).withMessage("Invalid status"), validate];
