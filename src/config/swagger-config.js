export const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "DigiMart E-commerce API",
    version: "1.0.0",
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
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "User ID",
          },
          firstName: {
            type: "string",
            description: "User's first name",
          },
          lastName: {
            type: "string",
            description: "User's last name",
          },
          email: {
            type: "string",
            format: "email",
            description: "User's email address",
          },
          phone: {
            type: "string",
            description: "User's phone number",
          },
          role: {
            type: "string",
            enum: ["USER", "ADMIN"],
            description: "User role",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Last update timestamp",
          },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Product ID",
          },
          name: {
            type: "string",
            description: "Product name",
          },
          price: {
            type: "number",
            format: "float",
            description: "Product price",
          },
          oldPrice: {
            type: "number",
            format: "float",
            description: "Original price (for discounted products)",
          },
          description: {
            type: "string",
            description: "Product description",
          },
          image: {
            type: "string",
            description: "Main product image URL",
          },
          images: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Additional product image URLs",
          },
          brand: {
            type: "string",
            description: "Product brand",
          },
          categoryId: {
            type: "string",
            format: "uuid",
            description: "Category ID",
          },
          stock: {
            type: "integer",
            description: "Available stock",
          },
          featured: {
            type: "boolean",
            description: "Whether the product is featured",
          },
          isNewArrival: {
            type: "boolean",
            description: "Whether the product is a new arrival",
          },
          isBestSeller: {
            type: "boolean",
            description: "Whether the product is a best seller",
          },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "Category ID",
          },
          name: {
            type: "string",
            description: "Category name",
          },
          slug: {
            type: "string",
            description: "Category slug for URLs",
          },
          description: {
            type: "string",
            description: "Category description",
          },
          image: {
            type: "string",
            description: "Category image URL",
          },
          parentId: {
            type: "string",
            format: "uuid",
            description: "Parent category ID (for subcategories)",
          },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Order ID",
          },
          userId: {
            type: "string",
            format: "uuid",
            description: "User ID",
          },
          subtotal: {
            type: "number",
            format: "float",
            description: "Order subtotal",
          },
          shipping: {
            type: "number",
            format: "float",
            description: "Shipping cost",
          },
          total: {
            type: "number",
            format: "float",
            description: "Order total",
          },
          status: {
            type: "string",
            enum: ["PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"],
            description: "Order status",
          },
          paymentStatus: {
            type: "string",
            enum: ["PENDING", "PAID", "FAILED"],
            description: "Payment status",
          },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["firstName", "lastName", "email", "password"],
                properties: {
                  firstName: {
                    type: "string",
                  },
                  lastName: {
                    type: "string",
                  },
                  email: {
                    type: "string",
                    format: "email",
                  },
                  password: {
                    type: "string",
                    format: "password",
                  },
                  phone: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
          },
          400: {
            description: "Bad request - validation error",
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                  },
                  password: {
                    type: "string",
                    format: "password",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
          },
          401: {
            description: "Unauthorized - invalid credentials",
          },
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Get all products",
        parameters: [
          {
            in: "query",
            name: "page",
            schema: {
              type: "integer",
              default: 1,
            },
            description: "Page number",
          },
          {
            in: "query",
            name: "limit",
            schema: {
              type: "integer",
              default: 10,
            },
            description: "Number of items per page",
          },
        ],
        responses: {
          200: {
            description: "List of products",
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a new product (admin only)",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Product",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Product created successfully",
          },
          401: {
            description: "Unauthorized",
          },
          403: {
            description: "Forbidden - admin access required",
          },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: {
              type: "integer",
            },
            description: "Product ID",
          },
        ],
        responses: {
          200: {
            description: "Product details",
          },
          404: {
            description: "Product not found",
          },
        },
      },
    },
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "Get all categories",
        responses: {
          200: {
            description: "List of categories",
          },
        },
      },
    },
    "/api/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get user's cart",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "User's cart",
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },
    "/api/orders": {
      get: {
        tags: ["Orders"],
        summary: "Get user's orders",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "User's orders",
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },
  },
};
