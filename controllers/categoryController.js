// controllers\categoryController.js
const Category = require("../models/categoryModel");
const SubCategory = require("../models/categorySubModel");

// category ////////////////////////////////////////////
exports.storeCategory = async (req, res) => {
  try {
    const { name, library, subCategories } = req.body;

    // Check if a category with the same name already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({
        message: "Cannot add another category with the same name",
      });
    }

    // Create a new category
    const newCategory = new Category({
      name,
      library: Array.isArray(library) ? library : [library],
      subCategories: [] // Will be filled after creating subcategories
    });

    // Save the category to the database
    const savedCategory = await newCategory.save();

    // Create subcategories and link them to the created category
    const subCategoryIds = [];
    for (const subCategoryName of subCategories) {
      const newSubCategory = new SubCategory({
        name: subCategoryName,
        parentCategory: savedCategory._id,
      });
      const savedSubCategory = await newSubCategory.save();
      subCategoryIds.push(savedSubCategory._id);
    }

    // Update the category with the subcategory references
    savedCategory.subCategories = subCategoryIds;
    await savedCategory.save();

    // Send a success response
    return res.status(200).json({
      message: "Category and subcategories created successfully",
    });

  } catch (err) {
    // Send an error response
    res.status(500).json({
      message: err.toString(),
    });
  }
};


exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true }).populate('subCategories');
    if (categories.length === 0) {
      return res.status(400).json({
        message: "No categories found"
      });
    }
    return res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getSingleCategory = async (req, res) => { // Get a single category with subcategories
  try {
    const categoryId = req.params.id;
    if (!categoryId) {
      return res.status(400).json({
        message: "Category ID not provided"
      });
    }

    // Find the category and populate subCategories
    const category = await Category.findById(categoryId)
      .populate({
        path: 'subCategories',
        select: 'name is_active CreatedAt', // Select only the fields you need
        match: { is_active: true } // Optional: filter to include only active subcategories
      });

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
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
    const categoryId  = req.params.id;
    const { name, library, subCategories } = req.body;

    // Update the main category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name, library },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
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

          if (subCategory._id) {
            // Update existing subcategory
            const updatedSubCategory = await SubCategory.findByIdAndUpdate(
              subCategory._id,
              { name: subCategory.name },
              { new: true }
            );
            return updatedSubCategory._id;
          } else {
            // Create new subcategory
            const newSubCategory = new SubCategory({
              name: subCategory.name,
              parentCategory: categoryId
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

    return res.status(200).json({ message: "Category updated successfully", updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error); // Log the error
    return res.status(500).json({ message: "Internal Server Error", error: error.message }); // Return error message
  }
};



exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Find the category to delete
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Find and delete all subcategories related to the category
    await SubCategory.deleteMany({ parentCategory: categoryId });

    // Delete the category itself
    await Category.findByIdAndDelete(categoryId);

    return res.status(200).json({ message: "Category and its subcategories deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.changeStatusCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Find the category by ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
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

    return res.status(200).json({ message: "Category status changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
