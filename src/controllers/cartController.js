import prisma from "../models/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

// Get user's cart
export const getUserCart = async (req, res, next) => {
  try {
    // Find user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // If cart doesn't exist, create one
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

    res.status(200).json({
      status: "success",
      data: {
        cart: {
          id: cart.id,
          items: cart.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            quantity: item.quantity,
            subtotal: Number(item.product.price) * item.quantity,
          })),
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
export const addItemToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product ID
    const product = await prisma.product.findUnique({
      where: { id: Number.parseInt(productId, 10) },
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return next(new AppError("Product is out of stock", 400));
    }

    // Find or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: req.user.id,
        },
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: Number.parseInt(productId, 10),
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity if item already exists
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
        include: {
          product: true,
        },
      });
    } else {
      // Add new item to cart
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: Number.parseInt(productId, 10),
          quantity,
        },
        include: {
          product: true,
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        item: {
          id: cartItem.id,
          productId: cartItem.productId,
          name: cartItem.product.name,
          price: cartItem.product.price,
          image: cartItem.product.image,
          quantity: cartItem.quantity,
          subtotal: Number(cartItem.product.price) * cartItem.quantity,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return next(new AppError("Quantity must be at least 1", 400));
    }

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: Number.parseInt(productId, 10),
        },
      },
    });

    if (!cartItem) {
      return next(new AppError("Item not found in cart", 404));
    }

    // Check if product is in stock
    const product = await prisma.product.findUnique({
      where: { id: Number.parseInt(productId, 10) },
    });

    if (product.stock < quantity) {
      return next(new AppError(`Only ${product.stock} items available in stock`, 400));
    }

    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: {
        quantity,
      },
      include: {
        product: true,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        item: {
          id: updatedCartItem.id,
          productId: updatedCartItem.productId,
          name: updatedCartItem.product.name,
          price: updatedCartItem.product.price,
          image: updatedCartItem.product.image,
          quantity: updatedCartItem.quantity,
          subtotal: Number(updatedCartItem.product.price) * updatedCartItem.quantity,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
export const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: Number.parseInt(productId, 10),
        },
      },
    });

    if (!cartItem) {
      return next(new AppError("Item not found in cart", 404));
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Clear cart
export const clearCart = async (req, res, next) => {
  try {
    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
