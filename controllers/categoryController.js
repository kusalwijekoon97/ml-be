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
    const categories = await Category.find(query);
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
    const { name, library, subCategories } = req.body;

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID not found" });
    }

    // Validate the category data
    if (!name || !Array.isArray(library)) {
      return res.status(400).json({ message: "Invalid category data" });
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { name, library },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update or create subcategories
    if (Array.isArray(subCategories)) {
      const existingSubCategories = await SubCategory.find({ parentCategory: categoryId });

      // Delete subcategories that are not in the updated list
      for (const subCategory of existingSubCategories) {
        if (!subCategories.some(sc => sc._id && sc._id.toString() === subCategory._id.toString())) {
          await SubCategory.findByIdAndDelete(subCategory._id);
        }
      }

      // Update existing subcategories and create new ones
      const subCategoryIds = [];
      for (const subCategory of subCategories) {
        if (!subCategory.name) {
          return res.status(400).json({ message: "Subcategory name is required" });
        }

        if (subCategory._id) {
          // Update existing subcategory
          const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            subCategory._id,
            { name: subCategory.name },
            { new: true }
          );
          if (updatedSubCategory) subCategoryIds.push(updatedSubCategory._id);
        } else {
          // Create new subcategory
          const newSubCategory = new SubCategory({
            name: subCategory.name,
            parentCategory: categoryId
          });
          const savedSubCategory = await newSubCategory.save();
          subCategoryIds.push(savedSubCategory._id);
        }
      }

      // Update the category with the subcategory references
      updatedCategory.subCategories = subCategoryIds;
      await updatedCategory.save();
    }

    return res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
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


// sub category ///////////////////////////////////////////////////////
exports.storeSubCategory = async (req, res) => {
  try {
    const { name, parentCategory } = req.body;

    // Check if parent category exists
    const categoryExists = await Category.findById(parentCategory);
    if (!categoryExists) {
      return res.status(400).json({
        message: "Parent category does not exist",
      });
    }

    // Check if subcategory with the same name already exists
    const subcategoryExists = await SubCategory.findOne({ name });
    if (subcategoryExists) {
      return res.status(400).json({
        message: "Cannot add another subcategory with the same name",
      });
    }

    // Create the new subcategory
    const subCategory = new SubCategory(req.body);
    await subCategory.save();

    // Update the parent category to include the new subcategory
    categoryExists.subCategories.push(subCategory._id);
    await categoryExists.save();

    return res.status(200).json({
      message: "Sub Category Created",
      subCategory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


exports.getAllSubCategories = async (req, res) => { //retrieving all data
  try {
    const subCategories = await SubCategory.find({ is_active: true });
    if (subCategories.length === 0) {
      return res.status(400).json({
        message: "No sub categories found"
      });
    }
    return res.status(200).json(subCategories);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getSingleSubCategory = async (req, res) => { //get a single sub category
  try {
    const subCategoryId = req.params.id;
    if (!subCategoryId) {
      return res.status(400).json({
        message: "Category ID not provided"
      });
    }
    const subCategory = await Category.findById(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({
        message: "Sub category not found"
      });
    }
    return res.status(200).json(subCategory);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

exports.getSearchedSubCategories = async (req, res) => { //retrieving search-filtered data by name or category
  try {
    const { name, category } = req.query;
    const query = { is_active: true };
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (category) {
      query.parentCategory = category;
    }
    const subCategories = await SubCategory.find(query);
    if (subCategories.length === 0) {
      return res.status(400).json({
        message: "No sub categories found"
      });
    }
    return res.status(200).json(subCategories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

exports.updateSubCategory = async (req, res) => { //updating sub category
  try {
    const subCategoryId = req.params.id;
    const { name, parentCategory } = req.body;
    if (!subCategoryId) {
      return res.status(400).json({
        message: "Sub Category ID not found"
      });
    }
    const subCategoryExists = await SubCategory.findOne({ name, parentCategory });
    const category = await Category.findById(parentCategory);
    if (subCategoryExists && subCategoryExists._id != subCategoryId) {
      return res.status(400).json({
        message: `Sub category already exists for ${category.name} category`
      });
    }
    const response = await SubCategory.findByIdAndUpdate(subCategoryId, { name, parentCategory }, { new: true });
    if (!response) {
      return res.status(400).json({
        message: "Sub category not found"
      });
    }
    return res.status(200).json(
      {
        message: "Sub category updated",
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

exports.deleteSubCategory = async (req, res) => { //disabling sub categories
  try {
    const subCategoryId = req.params.id;
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: "Sub category not found" });
    }
    subCategory.is_active = false;
    await subCategory.save();
    return res.status(200).json(
      { message: "Sub category deleted" }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};