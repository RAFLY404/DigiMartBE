import { uploadFile, deleteFile } from "../utils/fileUpload.js";
import { AppError } from "../middleware/errorHandler.js";
import logger from "../utils/logger.js";

// Upload product image
export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("Please upload an image file", 400));
    }

    const result = await uploadFile(req.file, "products");

    res.status(200).json({
      status: "success",
      data: {
        url: result.url,
        filename: result.filename,
      },
    });
  } catch (error) {
    logger.error("Error uploading product image:", error);
    next(error);
  }
};

// Upload multiple product images
export const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError("Please upload at least one image file", 400));
    }

    const uploadPromises = req.files.map((file) => uploadFile(file, "products"));
    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      status: "success",
      data: {
        images: results.map((result) => ({
          url: result.url,
          filename: result.filename,
        })),
      },
    });
  } catch (error) {
    logger.error("Error uploading product images:", error);
    next(error);
  }
};

// Delete file
export const deleteUploadedFile = async (req, res, next) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return next(new AppError("File path is required", 400));
    }

    const result = await deleteFile(filePath);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    logger.error("Error deleting file:", error);
    next(error);
  }
};
