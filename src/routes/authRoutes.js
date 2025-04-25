import express from "express";
import { register, login, logout, getMe, requestPasswordReset, updatePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRegister, validateLogin, validatePasswordUpdate } from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/password/reset", requestPasswordReset);
router.post("/password/update", protect, validatePasswordUpdate, updatePassword);

export default router;
