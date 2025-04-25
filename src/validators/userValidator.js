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

// Validate profile update
export const validateProfileUpdate = [
  body("firstName").optional().trim().isLength({ min: 2, max: 50 }).withMessage("First name must be between 2 and 50 characters"),

  body("lastName").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Last name must be between 2 and 50 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage("Please provide a valid phone number"),

  validate,
];

// Validate address
export const validateAddress = [
  body("name").trim().notEmpty().withMessage("Address name is required").isLength({ min: 2, max: 100 }).withMessage("Address name must be between 2 and 100 characters"),

  body("address").trim().notEmpty().withMessage("Address is required").isLength({ min: 5, max: 255 }).withMessage("Address must be between 5 and 255 characters"),

  body("city").trim().notEmpty().withMessage("City is required").isLength({ min: 2, max: 100 }).withMessage("City must be between 2 and 100 characters"),

  body("zipCode")
    .trim()
    .notEmpty()
    .withMessage("Zip code is required")
    .matches(/^[0-9]{5,10}$/)
    .withMessage("Please provide a valid zip code"),

  body("isDefault").optional().isBoolean().withMessage("isDefault must be a boolean value"),

  validate,
];

// Validate payment method
export const validatePaymentMethod = [
  body("type").trim().notEmpty().withMessage("Payment method type is required").isIn(["CREDIT_CARD", "BANK_TRANSFER", "E_WALLET"]).withMessage("Invalid payment method type"),

  body("details")
    .notEmpty()
    .withMessage("Payment details are required")
    .custom((value) => {
      if (typeof value !== "object" || value === null) {
        throw new Error("Payment details must be an object");
      }
      return true;
    }),

  body("isDefault").optional().isBoolean().withMessage("isDefault must be a boolean value"),

  validate,
];
