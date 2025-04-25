import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import logger from "./logger.js";

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define uploads directory - two levels up from utils folder + uploads
const uploadsDir = path.join(__dirname, "../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info(`Created uploads directory at ${uploadsDir}`);
}

/**
 * Upload file to local storage
 * @param {Object} file - Express file object (req.file)
 * @param {String} folder - Subfolder within uploads directory
 * @returns {Object} - File information including URL
 */
export const uploadFile = async (file, folder = "products") => {
  try {
    // Create folder if it doesn't exist
    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(folderPath, fileName);

    // Write file to disk
    await fs.promises.writeFile(filePath, file.buffer);

    // Generate URL path (relative to server root)
    const urlPath = `/uploads/${folder}/${fileName}`;

    return {
      success: true,
      url: urlPath,
      path: filePath,
      filename: fileName,
    };
  } catch (error) {
    logger.error("Error uploading file to local storage:", error);
    throw error;
  }
};

/**
 * Delete file from local storage
 * @param {String} filePath - Path to file
 * @returns {Object} - Success status
 */
export const deleteFile = async (filePath) => {
  try {
    // If filePath is a URL path, convert to absolute path
    if (filePath.startsWith("/uploads/")) {
      filePath = path.join(uploadsDir, filePath.replace("/uploads/", ""));
    }

    // Check if file exists
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return {
        success: true,
        message: "File deleted successfully",
      };
    } else {
      logger.warn(`File not found: ${filePath}`);
      return {
        success: false,
        message: "File not found",
      };
    }
  } catch (error) {
    logger.error("Error deleting file from local storage:", error);
    throw error;
  }
};

/**
 * Get absolute file path from URL path
 * @param {String} urlPath - URL path of file
 * @returns {String} - Absolute file path
 */
export const getAbsoluteFilePath = (urlPath) => {
  if (urlPath.startsWith("/uploads/")) {
    return path.join(uploadsDir, urlPath.replace("/uploads/", ""));
  }
  return urlPath;
};
