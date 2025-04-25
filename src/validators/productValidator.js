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

// Validate product
export const validateProduct = [
  body("name").trim().notEmpty().withMessage("Product name is required").isLength({ min: 3, max: 100 }).withMessage("Product name must be between 3 and 100 characters"),

  body("price").notEmpty().withMessage("Price is required").isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("oldPrice").optional().isFloat({ min: 0 }).withMessage("Old price must be a positive number"),

  body("description").trim().notEmpty().withMessage("Description is required").isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),

  body("image").trim().notEmpty().withMessage("Product image is required").isURL().withMessage("Image must be a valid URL"),

  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array")
    .custom((images) => {
      if (images && images.length > 0) {
        const validUrls = images.every((img) => {
          try {
            new URL(img);
            return true;
          } catch (err) {
            return false;
          }
        });
        if (!validUrls) {
          throw new Error("All images must be valid URLs");
        }
      }
      return true;
    }),

  body("brand").trim().notEmpty().withMessage("Brand is required").isLength({ min: 2, max: 50 }).withMessage("Brand must be between 2 and 50 characters"),

  body("categoryId")
    .trim()
    .notEmpty()
    .withMessage("Category ID is required")
    .matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)
    .withMessage("Category ID must be a valid UUID"),

  body("stock").notEmpty().withMessage("Stock is required").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),

  body("featured").optional().isBoolean().withMessage("Featured must be a boolean value"),

  body("isNewArrival").optional().isBoolean().withMessage("isNewArrival must be a boolean value"),

  body("isBestSeller").optional().isBoolean().withMessage("isBestSeller must be a boolean value"),

  body("specifications")
    .optional()
    .custom((value) => {
      if (value && typeof value !== "object") {
        throw new Error("Specifications must be an object");
      }
      return true;
    }),

  validate,
];
