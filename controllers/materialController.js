// controllers\materialController.js
const Material = require("../models/materialModel");
const uploadFile = require("../middleware/fileUpload/uploadFilesMiddleware");
const s3Client = require("../utils/s3Client");
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.storeMaterial = async (req, res) => { //storing a material
  try {
    const { name } = req.body;
    const materialName = await uploadFile(req.file);
    const newMaterial = await Material.create({ 
      name: name, 
      material_path: materialName 
    });
    
    if (newMaterial) {
      return res.status(201).json({
        success: true,
        message: "Material created successfully",
        data: newMaterial,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Material creation failed",
        error: {
          code: "MATERIAL_CREATION_FAILED",
          details: "The material could not be created due to an unknown issue.",
        },
      });
    }
  } catch (err) {
    console.error("Error creating material:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: err.message,
      },
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