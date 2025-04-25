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

// Validate category
export const validateCategory = [
  body("name").trim().notEmpty().withMessage("Category name is required").isLength({ min: 2, max: 50 }).withMessage("Category name must be between 2 and 50 characters"),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Slug must be between 2 and 50 characters")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug can only contain lowercase letters, numbers, and hyphens"),

  body("description").optional().trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),

  body("image").optional().trim().isURL().withMessage("Image must be a valid URL"),

  body("parentId")
    .optional()
    .trim()
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)
    .withMessage("Parent ID must be a valid UUID"),

  validate,
];
