import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define base uploads directory - one level up from scripts folder + uploads
const baseUploadsDir = path.join(__dirname, "../uploads");

// Define subdirectories
const directories = ["products", "categories"];

// Sample SVG content for product images
const generateProductSVG = (name, color) => `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="${color}" />
  <text x="400" y="300" font-family="Arial" font-size="48" text-anchor="middle" fill="white">${name}</text>
</svg>
`;

// Sample SVG content for category images
const generateCategorySVG = (name, color) => `
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="${color}" />
  <text x="300" y="200" font-family="Arial" font-size="36" text-anchor="middle" fill="white">${name}</text>
</svg>
`;

// Create directories if they don't exist
function createDirectories() {
  // Create base uploads directory if it doesn't exist
  if (!fs.existsSync(baseUploadsDir)) {
    fs.mkdirSync(baseUploadsDir, { recursive: true });
    console.log(`Created base uploads directory at ${baseUploadsDir}`);
  }

  // Create subdirectories
  for (const dir of directories) {
    const dirPath = path.join(baseUploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created uploads subdirectory at ${dirPath}`);
    }
  }
}

// Generate sample product images
function generateProductImages() {
  const products = [
    { name: "iPhone 13 Pro", color: "#007aff" },
    { name: "Samsung Galaxy S21", color: "#1428a0" },
    { name: "MacBook Pro 14-inch", color: "#86868b" },
    { name: "Dell XPS 15", color: "#0076ce" },
    { name: "Classic Fit Polo Shirt", color: "#006039" },
    { name: "Slim Fit Jeans", color: "#0076ce" },
    { name: "Stand Mixer", color: "#c41230" },
    { name: "Coffee Maker", color: "#333333" },
  ];

  for (const product of products) {
    const baseName = product.name.toLowerCase().replace(/\s+/g, "-");
    const filePath = path.join(baseUploadsDir, "products", `${baseName}.svg`);
    fs.writeFileSync(filePath, generateProductSVG(product.name, product.color));
    console.log(`Generated product image: ${filePath}`);

    // Generate additional images for each product
    for (let i = 1; i <= 2; i++) {
      const additionalFilePath = path.join(baseUploadsDir, "products", `${baseName}-${i}.svg`);
      fs.writeFileSync(additionalFilePath, generateProductSVG(`${product.name} - View ${i}`, product.color));
      console.log(`Generated additional product image: ${additionalFilePath}`);
    }
  }
}

// Generate sample category images
function generateCategoryImages() {
  const categories = [
    { name: "Electronics", color: "#007aff" },
    { name: "Clothing", color: "#5856d6" },
    { name: "Home & Kitchen", color: "#ff9500" },
    { name: "Smartphones", color: "#34c759" },
    { name: "Laptops", color: "#ff2d55" },
    { name: "Men's Clothing", color: "#af52de" },
    { name: "Women's Clothing", color: "#ff9500" },
    { name: "Kitchen Appliances", color: "#ff3b30" },
  ];

  for (const category of categories) {
    const baseName = category.name.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "");
    const filePath = path.join(baseUploadsDir, "categories", `${baseName}.svg`);
    fs.writeFileSync(filePath, generateCategorySVG(category.name, category.color));
    console.log(`Generated category image: ${filePath}`);
  }
}

// Main function
function main() {
  try {
    console.log("Starting sample image generation...");
    createDirectories();
    generateProductImages();
    generateCategoryImages();
    console.log("Sample image generation completed successfully!");
  } catch (error) {
    console.error("Error generating sample images:", error);
    process.exit(1);
  }
}

// Run the script
main();
