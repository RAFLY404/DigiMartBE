import express from "express";
import { createOrder, getUserOrders, getOrderDetails, cancelOrder, updateOrderStatus } from "../controllers/orderController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { validateOrder, validateOrderStatus } from "../validators/orderValidator.js";

const router = express.Router();

// Protect all routes
router.use(protect);

router.post("/", validateOrder, createOrder);
router.get("/", getUserOrders);
router.get("/:id", getOrderDetails);
router.put("/:id/cancel", cancelOrder);

// Admin routes
router.put("/:id/status", restrictTo("ADMIN"), validateOrderStatus, updateOrderStatus);

export default router;
