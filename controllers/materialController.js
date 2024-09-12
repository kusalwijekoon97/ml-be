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
        data: {
          name: newMaterial.name,
          material_path: newMaterial.material_path,
        }
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : '';

    const query = {
      ...(
        search && {
          $or: [
            { name: { $regex: search, $options: 'i' } },
          ],
        }
      ),
    };

    const materials = await Material.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const totalItems = await Material.countDocuments(query);

    // // Generate a signed URL for each material's profile image
    // for (const material of materials) {
    //   if (material.material_path) {
    //     const getObjectParams = {
    //       Bucket: process.env.S3_BUCKET_NAME,
    //       Key: material.material_path,
    //     };

    //     const command = new GetObjectCommand(getObjectParams);
    //     const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    //     material.imageUrl = url;
    //   }
    // }

    // Check if any materials were found
    if (materials.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No materials found",
        error: {
          code: "NO_MATERIALS_FOUND",
          details: "There are no materials available in the database.",
        },
      });
    }

    // Return the list of materials
    return res.status(200).json({
      success: true,
      message: "Materials retrieved successfully",
      data: materials,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error retrieving materials:", err);
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

exports.showMaterial = async (req, res) => { //retrieve a single material by ID
  try {
    const materialId = req.params.id;
    // Find the material by ID
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
        error: {
          code: "MATERIAL_NOT_FOUND",
          details: "The material with the provided ID does not exist.",
        },
      });
    }

    // // Generate a signed URL for the material's profile image if it exists
    // if (material.material_path) {
    //   const getObjectParams = {
    //     Bucket: process.env.S3_BUCKET_NAME,
    //     Key: material.material_path,
    //   };
    //   const command = new GetObjectCommand(getObjectParams);
    //   const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    //   material.imageUrl = url;
    // }

    // Return the material details
    return res.status(200).json({
      success: true,
      message: "Material retrieved successfully",
      data: material,
    });
  } catch (err) {
    console.error("Error retrieving material:", err);
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

exports.getOpenAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ is_active: true })
      .sort({ name: 1 })
      .select('name material_path _id');

    // Check if no materials were found
    if (materials.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No materials found",
        error: {
          code: "MATERIALS_NOT_FOUND",
          details: "No active materials are available in the system.",
        },
      });
    }

    // Return the list of materials
    return res.status(200).json({
      success: true,
      message: "Materials retrieved successfully",
      data: materials
    });
  } catch (err) {
    console.error("Error retrieving materials:", err);
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

exports.updateMaterial = async (req, res) => { //update a material by ID
  try {
    const materialId = req.params.id;

    // Find the material by ID
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
        error: {
          code: "MATERIAL_NOT_FOUND",
          details: "The material with the provided ID does not exist.",
        },
      });
    }

    // Handle profile image upload if a new file is provided
    let materialName = material.material_path; // Preserve existing image if no new file is uploaded
    if (req.file) {
      // Upload the new profile image
      materialName = await uploadFile(req.file);

      // Delete the old profile image from S3 if it exists
      if (material.material_path) {
        const deleteObjectParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: material.material_path,
        };
        const command = new DeleteObjectCommand(deleteObjectParams);
        await s3Client.send(command);
      }
    }

    // Update the material with the new details
    const updatedMaterial = await Material.findByIdAndUpdate(
      materialId,
      { ...req.body, material_path: materialName },
      { new: true }
    );

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Material updated successfully",
      data: updatedMaterial,
    });
  } catch (error) {
    console.error("Error updating material:", error);
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

exports.deleteMaterial = async (req, res) => { //delete a material by ID
  try {
    const materialId = req.params.id;

    // Find the material by ID
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
        error: {
          code: "MATERIAL_NOT_FOUND",
          details: "The material with the provided ID does not exist.",
        },
      });
    }

    // If the material has a profile image, delete it from S3
    if (material.material_path) {
      const deleteObjectParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: material.material_path,
      };
      const command = new DeleteObjectCommand(deleteObjectParams);
      await s3Client.send(command);
    }

    // Mark the material as deleted (soft delete)
    material.deleted = true;
    await material.save();

    return res.status(200).json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting material:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: err.message,
      },
    });
  }
};

exports.changeStatusMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;

    // Validate that the material ID is provided
    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: "Material ID is required",
        error: {
          code: "MATERIAL_ID_MISSING",
          details: "A valid material ID must be provided in the request parameters.",
        },
      });
    }

    // Find the material by ID
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
        error: {
          code: "MATERIAL_NOT_FOUND",
          details: `No material found with the ID ${materialId}.`,
        },
      });
    }

    // Toggle the is_active status
    material.is_active = !material.is_active;
    await material.save();

    return res.status(200).json({
      success: true,
      message: "Material status changed successfully",
      data: {
        materialId: material._id,
        is_active: material.is_active
      },
    });
  } catch (error) {
    console.error("Error changing material status:", error);
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