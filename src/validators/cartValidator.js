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

// Validate cart item
export const validateCartItem = [
  body("productId").notEmpty().withMessage("Product ID is required").isInt({ min: 1 }).withMessage("Product ID must be a positive integer"),

  body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),

  validate,
];

// Validate cart item update
export const validateCartItemUpdate = [body("quantity").notEmpty().withMessage("Quantity is required").isInt({ min: 1 }).withMessage("Quantity must be at least 1"), validate];
