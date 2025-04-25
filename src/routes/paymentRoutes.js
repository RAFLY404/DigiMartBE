import express from "express";
import { createPaymentIntent, paymentWebhook, getPaymentStatus } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validatePaymentIntent } from "../validators/paymentValidator.js";

const router = express.Router();

// Public webhook route
router.post("/webhook", paymentWebhook);

// Protected routes
router.use(protect);

router.post("/create", validatePaymentIntent, createPaymentIntent);
router.get("/:orderId/status", getPaymentStatus);

export default router;
