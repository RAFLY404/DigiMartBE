import express from "express";
import { getAllProducts, getFeaturedProducts, getNewArrivals, getBestSellers, getDeals, getProductDetails, searchProducts, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { validateProduct } from "../validators/productValidator.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/best-sellers", getBestSellers);
router.get("/deals", getDeals);
router.get("/search", searchProducts);
router.get("/:id", getProductDetails);

// Admin routes
router.use(protect);
router.use(restrictTo("ADMIN"));

router.post("/", validateProduct, createProduct);
router.put("/:id", validateProduct, updateProduct);
router.delete("/:id", deleteProduct);

export default router;
