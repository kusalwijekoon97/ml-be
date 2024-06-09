// controllers\materialController.js
const Material = require("../models/materialModel");

exports.storeMaterial = async (req, res) => { //storing a material
  try {
    const { name } = req.body;
    const materialExists = await Material.findOne({ name });
    if (materialExists) {
      return res.status(400).json({
        message: "Cannot add another material with same name",
      });
    }
    const response = await Material.create({name});
    if (response) {
      return res.status(200).json({
        message: "Material Created",
      });
    } else {
      return res.status(400).json({
        message: "Material Creation failed.",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getAllMaterials = async (req, res) => { //retrieving all data
  try {
    const materials = await Material.find({}).sort({name: 1});

    if (materials.length === 0) {
      return res.status(400).json({
        message: "No materials found",
      });
    }
    return res.status(200).json(materials);
  } catch (err) {
    console.error("Error retrieving materials:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString(),
    });
  }
};

exports.showMaterial = async (req, res) => { //retrieve a single material by ID
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }
    return res.status(200).json(material);
  } catch (err) {
    console.error("Error retrieving material:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString(),
    });
  }
};

exports.updateMaterial = async (req, res) => { //update a material by ID
  try {
    const { name } = req.body;
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }
    return res.status(200).json({
      message: "Material updated successfully",
      material,
    });
  } catch (err) {
    console.error("Error updating material:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString(),
    });
  }
};

exports.deleteMaterial = async (req, res) => { //delete a material by ID
  try {
    const material = await Material.findByIdAndDelete(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Material not found",
      });
    }
    return res.status(200).json({
      message: "Material deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting material:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString(),
    });
  }
};