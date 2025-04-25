import express from "express";
import { getAllCategories, getCategoryBySlug, getProductsByCategory, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { validateCategory } from "../validators/categoryValidator.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);
router.get("/:slug/products", getProductsByCategory);

// Admin routes
router.use(protect);
router.use(restrictTo("ADMIN"));

router.post("/", validateCategory, createCategory);
router.put("/:id", validateCategory, updateCategory);
router.delete("/:id", deleteCategory);

export default router;
