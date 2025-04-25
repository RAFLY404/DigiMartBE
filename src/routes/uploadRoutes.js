import express from "express";
import { uploadProductImage, uploadProductImages, deleteUploadedFile } from "../controllers/uploadController.js";
import { upload, handleUploadError } from "../middleware/uploadMiddleware.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(restrictTo("ADMIN"));

// Upload routes
router.post("/products/image", upload.single("image"), handleUploadError, uploadProductImage);
router.post("/products/images", upload.array("images", 10), handleUploadError, uploadProductImages);
router.delete("/delete", deleteUploadedFile);

// Use named export instead of default export
// export { router as uploadRoutes };
export default router;
