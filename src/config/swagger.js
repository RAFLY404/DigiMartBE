import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json manually instead of importing it
const packageJsonPath = path.join(__dirname, "../../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const { version } = packageJson;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DigiMart E-commerce API Documentation",
      version,
      description: "API documentation for the DigiMart E-commerce platform",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
      contact: {
        name: "DigiMart Support",
        url: "https://digimart.example.com",
        email: "support@digimart.example.com",
      },
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/models/*.js", "./src/docs/*.js"],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
