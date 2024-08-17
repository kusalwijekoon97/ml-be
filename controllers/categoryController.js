// controllers\categoryController.js
const Category = require("../models/categoryModel");
const SubCategory = require("../models/categorySubModel");

// category ////////////////////////////////////////////
exports.storeCategory = async (req, res) => {
  try {
    const { name, main_slug, library, subCategories } = req.body;

    // Check if a category with the same name already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Cannot add another category with the same name",
        error: {
          code: "CATEGORY_EXISTS",
          details: `A category with the name '${name}' already exists.`,
        },
      });
    }

    // Create a new category
    const newCategory = new Category({
      name,
      main_slug,
      library: Array.isArray(library) ? library : [library],
      subCategories: [] // Will be filled after creating subcategories
    });

    // Save the category to the database
    const savedCategory = await newCategory.save();

    // Create subcategories and link them to the created category
    const subCategoryIds = [];
    const subCategoryData = [];
    for (const subCategory of subCategories) {
      const newSubCategory = new SubCategory({
        name: subCategory.name,
        sub_slug: subCategory.sub_slug,
        parentCategory: savedCategory._id,
      });
      const savedSubCategory = await newSubCategory.save();
      subCategoryIds.push(savedSubCategory._id);
      subCategoryData.push({
        id: savedSubCategory._id,
        name: savedSubCategory.name,
        parentCategory: savedSubCategory.parentCategory,
        createdAt: savedSubCategory.createdAt,
      });
    }

    // Update the category with the subcategory references
    savedCategory.subCategories = subCategoryIds;
    await savedCategory.save();

    // Send a success response
    return res.status(201).json({
      success: true,
      message: "Category and subcategories created successfully",
      data: {
        category: {
          id: savedCategory._id,
          name: savedCategory.name,
          library: savedCategory.library,
          subCategories: subCategoryData,
          createdAt: savedCategory.createdAt,
        }
      }
    });

  } catch (err) {
    // Send an error response
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the category and subcategories",
      error: {
        code: "SERVER_ERROR",
        details: err.message,
      },
    });
  }
};


exports.getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : '';

    const query = search
      ? {
        $or: [
          { name: { $regex: search, $options: 'i' } }
        ],
      }
      : {};

    const categories = await Category.find(query)
      .populate('library')
      .populate('subCategories')
      .skip(skip)
      .limit(limit);

    const totalItems = await Category.countDocuments();

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving categories",
      error: {
        code: "SERVER_ERROR",
        details: err.message,
      },
    });
  }
};


exports.getSingleCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID not provided",
        error: {
          code: "CATEGORY_ID_MISSING",
          details: "A valid category ID must be provided in the request parameters.",
        },
      });
    }

    // Find the category and populate subCategories
    const category = await Category.findById(categoryId)
      .populate({
        path: 'subCategories',
        select: 'name sub_slug is_active createdAt', // Select only the fields you need
        match: { is_active: true }, // Optional: filter to include only active subcategories
      }).populate({
        path: 'library',
        select: '_id name',
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        error: {
          code: "CATEGORY_NOT_FOUND",
          details: `No category found with the ID ${categoryId}.`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: error.message,
      },
    });
  }
};


exports.getSearchedCategories = async (req, res) => { //retrieving search-filtered data by name or library
  try {
    const { name, library } = req.query;
    const query = { is_active: true };
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (library) {
      query.library = { $regex: library, $options: 'i' };
    }
    const categories = await Category.find(query).sort({ name: 1 });
    if (categories.length === 0) {
      return res.status(400).json({
        message: "No categories found"
      });
    }
    return res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, main_slug, library, subCategories } = req.body;

    // Validate that the category ID is provided
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
        error: {
          code: "CATEGORY_ID_MISSING",
          details: "A valid category ID must be provided in the request parameters.",
        },
      });
    }

    // Update the main category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name, main_slug, library },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        error: {
          code: "CATEGORY_NOT_FOUND",
          details: `No category found with the ID ${categoryId}.`,
        },
      });
    }

    if (Array.isArray(subCategories)) {
      const existingSubCategories = await SubCategory.find({ parentCategory: categoryId });

      // Delete subcategories that are not in the updated list
      await Promise.all(
        existingSubCategories.map(async (subCategory) => {
          if (!subCategories.some(sc => sc._id && sc._id.toString() === subCategory._id.toString())) {
            await SubCategory.findByIdAndDelete(subCategory._id);
          }
        })
      );

      // Update existing subcategories and create new ones
      const subCategoryIds = await Promise.all(
        subCategories.map(async (subCategory) => {
          if (!subCategory.name) {
            throw new Error("Subcategory name is required");
          }
          if (!subCategory.sub_slug) {
            throw new Error("Subcategory slug is required");
          }

          if (subCategory._id) {
            // Update existing subcategory
            const updatedSubCategory = await SubCategory.findByIdAndUpdate(
              subCategory._id,
              { name: subCategory.name, sub_slug: subCategory.sub_slug },
              { new: true }
            );
            return updatedSubCategory._id;
          } else {
            // Create new subcategory
            const newSubCategory = new SubCategory({
              name: subCategory.name,
              sub_slug: subCategory.sub_slug ,
              parentCategory: categoryId,
            });
            const savedSubCategory = await newSubCategory.save();
            return savedSubCategory._id;
          }
        })
      );

      // Update the category with the subcategory references
      updatedCategory.subCategories = subCategoryIds;
      await updatedCategory.save();
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: error.message,
      },
    });
  }
};


exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Validate that the category ID is provided
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
        error: {
          code: "CATEGORY_ID_MISSING",
          details: "A valid category ID must be provided in the request parameters.",
        },
      });
    }

    // Find the category to delete
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        error: {
          code: "CATEGORY_NOT_FOUND",
          details: `No category found with the ID ${categoryId}.`,
        },
      });
    }

    // Find and delete all subcategories related to the category
    await SubCategory.deleteMany({ parentCategory: categoryId });

    // Delete the category itself
    await Category.findByIdAndDelete(categoryId);

    return res.status(200).json({
      success: true,
      message: "Category and its subcategories deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: error.message,
      },
    });
  }
};


exports.changeStatusCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Validate that the category ID is provided
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
        error: {
          code: "CATEGORY_ID_MISSING",
          details: "A valid category ID must be provided in the request parameters.",
        },
      });
    }

    // Find the category by ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        error: {
          code: "CATEGORY_NOT_FOUND",
          details: `No category found with the ID ${categoryId}.`,
        },
      });
    }

    // Toggle the is_active status
    category.is_active = !category.is_active;
    await category.save();

    // Find and update relevant subcategories
    const subcategories = await SubCategory.find({ parentCategory: categoryId });
    for (const subcategory of subcategories) {
      subcategory.is_active = category.is_active; // Set subcategory status to match category status
      await subcategory.save();
    }

    return res.status(200).json({
      success: true,
      message: "Category status changed successfully",
      data: {
        categoryId: category._id,
        is_active: category.is_active,
        subCategoriesUpdated: subcategories.length,
      },
    });
  } catch (error) {
    console.error("Error changing category status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: error.message,
      },
    });
  }
};
