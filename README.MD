# DigiMart E-commerce Backend

A complete backend API for the DigiMart e-commerce platform using Node.js with Express, PostgreSQL as the database, and Prisma as the ORM.

## Features

- User authentication with JWT
- Product management
- Category management
- Shopping cart functionality
- Order processing
- Payment integration with Midtrans
- API documentation with Swagger/OpenAPI

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Payment Gateway**: Midtrans
- **File Storage**: -
- **API Documentation**: Swagger/OpenAPI

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Midtrans account (for payment processing)

### Installation

1. Install dependencies:

\`\`\`bash
npm install
\`\`\`

2. Create a `.env` file based on the `sample.env`

3. Set up the database:

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

4. Start the development server:

\`\`\`bash
npm run dev
\`\`\`

## API Documentation

The API documentation is available at `/api-docs` when the server is running. This interactive documentation allows you to:

- Browse all available endpoints
- See request and response schemas
- Test API endpoints directly from the browser
- Understand authentication requirements

## Project Structure

\`\`\`
/
├── src/
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── docs/               # Swagger documentation
│   ├── middleware/         # Custom middleware
│   ├── models/             # Prisma schema and model helpers
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── validators/         # Request validators
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── prisma/
│   └── schema.prisma       # Prisma schema
├── .env                    # Environment variables
├── .gitignore
├── package.json
└── README.md
\`\`\`

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login (return JWT token)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/password/reset` - Request password reset
- `POST /api/auth/password/update` - Update password

### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Add new address
- `PUT /api/users/addresses/:id` - Update address
- `DELETE /api/users/addresses/:id` - Delete address
- `GET /api/users/payment-methods` - Get payment methods
- `POST /api/users/payment-methods` - Add payment method
- `DELETE /api/users/payment-methods/:id` - Delete payment method

### Product Endpoints

- `GET /api/products` - Get all products (with filtering, pagination)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/new-arrivals` - Get new arrivals
- `GET /api/products/best-sellers` - Get best sellers
- `GET /api/products/deals` - Get products on sale
- `GET /api/products/:id` - Get product details
- `GET /api/products/search?q=:query` - Search products
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Category Endpoints

- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug
- `GET /api/categories/:slug/products` - Get products by category
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Cart Endpoints

- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:productId` - Update cart item quantity
- `DELETE /api/cart/items/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Order Endpoints

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Payment Endpoints

- `POST /api/payments/create` - Create payment intent
- `POST /api/payments/webhook` - Payment webhook (for Midtrans)
- `GET /api/payments/:orderId/status` - Check payment status

## License

MIT

