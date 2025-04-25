import prisma from "../models/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

// Get all products with filtering and pagination
export const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", category, minPrice, maxPrice, brand, search } = req.query;

    const pageNumber = Number.parseInt(page, 10);
    const limitNumber = Number.parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter object
    const filter = {};

    if (category) {
      filter.categoryId = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.gte = Number.parseFloat(minPrice);
      if (maxPrice) filter.price.lte = Number.parseFloat(maxPrice);
    }

    if (brand) {
      filter.brand = brand;
    }

    if (search) {
      filter.OR = [{ name: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }];
    }

    // Get products
    const products = await prisma.product.findMany({
      where: filter,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        [sort]: order,
      },
      skip,
      take: limitNumber,
    });

    // Get total count for pagination
    const total = await prisma.product.count({
      where: filter,
    });

    res.status(200).json({
      status: "success",
      data: {
        products,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;
    const limitNumber = Number.parseInt(limit, 10);

    const products = await prisma.product.findMany({
      where: {
        featured: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limitNumber,
    });

    res.status(200).json({
      status: "success",
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get new arrivals
export const getNewArrivals = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;
    const limitNumber = Number.parseInt(limit, 10);

    const products = await prisma.product.findMany({
      where: {
        isNewArrival: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limitNumber,
    });

    res.status(200).json({
      status: "success",
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get best sellers
export const getBestSellers = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;
    const limitNumber = Number.parseInt(limit, 10);

    const products = await prisma.product.findMany({
      where: {
        isBestSeller: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limitNumber,
    });

    res.status(200).json({
      status: "success",
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get products on sale
export const getDeals = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;
    const limitNumber = Number.parseInt(limit, 10);

    const products = await prisma.product.findMany({
      where: {
        oldPrice: {
          not: null,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limitNumber,
    });

    res.status(200).json({
      status: "success",
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get product details
export const getProductDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = Number.parseInt(id, 10);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Search products
export const searchProducts = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return next(new AppError("Search query is required", 400));
    }

    const pageNumber = Number.parseInt(page, 10);
    const limitNumber = Number.parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await prisma.product.findMany({
      where: {
        OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limitNumber,
    });

    // Get total count for pagination
    const total = await prisma.product.count({
      where: {
        OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }],
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        products,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create product (admin only)
export const createProduct = async (req, res, next) => {
  try {
    const { name, price, oldPrice, description, image, images, brand, categoryId, stock, featured, isNewArrival, isBestSeller, specifications } = req.body;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        oldPrice,
        description,
        image,
        images: images || [],
        brand,
        categoryId,
        stock,
        featured: featured || false,
        isNewArrival: isNewArrival || false,
        isBestSeller: isBestSeller || false,
        specifications: specifications || {},
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update product (admin only)
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = Number.parseInt(id, 10);

    const { name, price, oldPrice, description, image, images, brand, categoryId, stock, featured, isNewArrival, isBestSeller, specifications } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return next(new AppError("Product not found", 404));
    }

    // Check if category exists if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return next(new AppError("Category not found", 404));
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price,
        oldPrice,
        description,
        image,
        images,
        brand,
        categoryId,
        stock,
        featured,
        isNewArrival,
        isBestSeller,
        specifications,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        product: updatedProduct,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete product (admin only)
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = Number.parseInt(id, 10);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return next(new AppError("Product not found", 404));
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
