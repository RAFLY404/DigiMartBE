import express from "express";
import { getUserCart, addItemToCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateCartItem, validateCartItemUpdate } from "../validators/cartValidator.js";

const router = express.Router();

// Protect all routes
router.use(protect);

router.get("/", getUserCart);
router.post("/items", validateCartItem, addItemToCart);
router.put("/items/:productId", validateCartItemUpdate, updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.delete("/", clearCart);

export default router;
