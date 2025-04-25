import express from "express";
import { getUserProfile, updateUserProfile, getUserAddresses, addAddress, updateAddress, deleteAddress, getPaymentMethods, addPaymentMethod, deletePaymentMethod } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateProfileUpdate, validateAddress, validatePaymentMethod } from "../validators/userValidator.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Profile routes
router.get("/profile", getUserProfile);
router.put("/profile", validateProfileUpdate, updateUserProfile);

// Address routes
router.get("/addresses", getUserAddresses);
router.post("/addresses", validateAddress, addAddress);
router.put("/addresses/:id", validateAddress, updateAddress);
router.delete("/addresses/:id", deleteAddress);

// Payment method routes
router.get("/payment-methods", getPaymentMethods);
router.post("/payment-methods", validatePaymentMethod, addPaymentMethod);
router.delete("/payment-methods/:id", deletePaymentMethod);

export default router;
