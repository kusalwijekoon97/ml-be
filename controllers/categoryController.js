// controllers\categoryController.js
const Category = require("../models/categoryModel");
const SubCategory  = require("../models/categorySubModel");

// category ////////////////////////////////////////////
exports.storeCategory = async (req, res) => {
  try {
    const { name, library, subCategories } = req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({
        message: "Cannot add another category with the same name",
      });
    }

    const newCategory = new Category({
      name,
      library: Array.isArray(library) ? library : [library],
      subCategories: [] // Will be filled after creating subcategories
    });

    const savedCategory = await newCategory.save();

    // Create subcategories and link them to the created category
    const subCategoryIds = [];
    for (const subCategory of subCategories) {
      const newSubCategory = new SubCategory({
        name: subCategory.name,
        parentCategory: savedCategory._id,
      });
      const savedSubCategory = await newSubCategory.save();
      subCategoryIds.push(savedSubCategory._id);
    }

    // Update the category with the subcategory references
    savedCategory.subCategories = subCategoryIds;
    await savedCategory.save();

    return res.status(200).json({
      message: "Category and subcategories created successfully",
    });

  } catch (err) {
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

// exports.getFilteredCategories = async (req, res) => { //retrieving filtered data by name
//   try {
//     const categories = await Category.find({ name: { $regex: req.body.name, $options: "i" } });
//     if (categories.length === 0) {
//       return res.status(400).json({
//         message: "No categories found"
//       });
//     }
//     return res.status(200).json(categories);
//   } catch (err) {
//     res.status(500).json({
//       message: err.toString(),
//     });
//   }
// };
exports.showCategory = async (req, res) => { //get a single category
  try {
    const categoryId = req.params.id;
    if (!categoryId) {
      return res.status(400).json({
        message: "Category ID not provided"
      });
    }
    const category = await Category.findById(categoryId);
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

exports.updateCategory = async (req, res) => { //updating category
  try {
    const categoryId = req.params.id;
    const { name, library } = req.body;
    if (!categoryId) {
      return res.status(400).json({
        message: "Category ID not found"
      });
    }
    const categoryExists = await Category.findOne({ name });
    if (categoryExists && categoryExists._id != categoryId) {
      return res.status(400).json({
        message: "Category name already exists"
      });
    }
    const response = await Category.findByIdAndUpdate(categoryId, { name, library }, { new: true });
    if (!response) {
      return res.status(400).json({
        message: "Category not found"
      });
    }
    return res.status(200).json(
      {
        message: "Category updated",
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

exports.deleteCategory = async (req, res) => { //disabling category and relevant sub categories
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    category.is_active = false;
    await category.save();
    const subcategories = await SubCategory .find({ parentCategory: categoryId });
    for (const subcategory of subcategories) {
      subcategory.is_active = false;
      await subcategory.save();
    }
    return res.status(200).json(
      { message: "Category deleted" }
    );
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
    const subCategories = await SubCategory .find({ is_active: true });
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

exports.showSubCategory = async (req, res) => { //get a single sub category
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
    const subCategories = await SubCategory .find(query);
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
    const subCategoryExists = await SubCategory .findOne({ name, parentCategory });
    const category = await Category.findById(parentCategory);
    if (subCategoryExists && subCategoryExists._id != subCategoryId) {
      return res.status(400).json({
        message: `Sub category already exists for ${category.name} category`
      });
    }
    const response = await SubCategory .findByIdAndUpdate(subCategoryId, { name, parentCategory }, { new: true });
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
    const subCategory = await SubCategory .findById(subCategoryId);
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