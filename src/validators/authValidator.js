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

// Validate user registration
export const validateRegister = [
  body("firstName").trim().notEmpty().withMessage("First name is required").isLength({ min: 2, max: 50 }).withMessage("First name must be between 2 and 50 characters"),

  body("lastName").trim().notEmpty().withMessage("Last name is required").isLength({ min: 2, max: 50 }).withMessage("Last name must be between 2 and 50 characters"),

  body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email address"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage("Please provide a valid phone number"),

  validate,
];

// Validate user login
export const validateLogin = [body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email address"), body("password").trim().notEmpty().withMessage("Password is required"), validate];

// Validate password update
export const validatePasswordUpdate = [
  body("currentPassword").trim().notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage("New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),

  validate,
];
