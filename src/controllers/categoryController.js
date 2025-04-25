import prisma from "../models/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

// Get all categories
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
      },
      where: {
        parentId: null, // Only get top-level categories
      },
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get category by slug
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get products by category
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = req.query;

    const pageNumber = Number.parseInt(page, 10);
    const limitNumber = Number.parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Find the category
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    // Get all subcategory IDs including the current category
    const categoryIds = [category.id, ...category.subcategories.map((sub) => sub.id)];

    // Get products
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryIds,
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
        [sort]: order,
      },
      skip,
      take: limitNumber,
    });

    // Get total count for pagination
    const total = await prisma.product.count({
      where: {
        categoryId: {
          in: categoryIds,
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        category,
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

// Create category (admin only)
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, parentId } = req.body;

    // Check if slug is already in use
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return next(new AppError("Slug is already in use", 400));
    }

    // Check if parent category exists if provided
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return next(new AppError("Parent category not found", 404));
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId,
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update category (admin only)
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, parentId } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return next(new AppError("Category not found", 404));
    }

    // Check if slug is already in use by another category
    if (slug && slug !== existingCategory.slug) {
      const categoryWithSlug = await prisma.category.findUnique({
        where: { slug },
      });

      if (categoryWithSlug) {
        return next(new AppError("Slug is already in use", 400));
      }
    }

    // Check if parent category exists if provided
    if (parentId) {
      // Prevent setting a category as its own parent
      if (parentId === id) {
        return next(new AppError("A category cannot be its own parent", 400));
      }

      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return next(new AppError("Parent category not found", 404));
      }

      // Prevent circular references
      let currentParent = parentCategory;
      while (currentParent.parentId) {
        if (currentParent.parentId === id) {
          return next(new AppError("Circular reference detected in category hierarchy", 400));
        }
        currentParent = await prisma.category.findUnique({
          where: { id: currentParent.parentId },
        });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        parentId,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        category: updatedCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete category (admin only)
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: true,
        products: true,
      },
    });

    if (!existingCategory) {
      return next(new AppError("Category not found", 404));
    }

    // Check if category has subcategories
    if (existingCategory.subcategories.length > 0) {
      return next(new AppError("Cannot delete category with subcategories", 400));
    }

    // Check if category has products
    if (existingCategory.products.length > 0) {
      return next(new AppError("Cannot delete category with products", 400));
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
