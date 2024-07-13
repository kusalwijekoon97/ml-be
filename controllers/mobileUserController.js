// controllers\mobileUserController.js
const MobileUser = require("../models/mobileUserModel");
const uploadFile = require("../middleware/fileUpload/uploadFilesMiddleware");
const bcrypt = require("bcryptjs");
const s3Client = require("../utils/s3Client");
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.storeMobileUser = async (req, res) => { //storing an mobileUser
  try {
    const { firstname, lastname, username,  email, password, country, mobileNumber, libraries, friends } = req.body;
    const profileImageName = await uploadFile(req.file);
 // Hash the password
 const hashedPW = await bcrypt.hash(password, 10);
    const response = await MobileUser.create({ ...req.body, hash:hashedPW, profilePicture: profileImageName });
    if (response) {
      return res.status(200).json({
        message: "Mobile user Created",
      });
    } else {
      return res.status(400).json({
        message: "Mobile user Creation failed.",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getAllMobileUsers = async (req, res) => { //retrieving all data
  try {
    const mobileUsers = await MobileUser.find({ deleted: false }).sort({ firstname: 1 });

    for (const mobileUser of mobileUsers) {
      if (!mobileUser.profileImage) {
        continue;
      }

      const getObjectParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: mobileUser.profileImage
      };

      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      mobileUser.imageUrl = url;
    }

    if (mobileUsers.length === 0) {
      return res.status(400).json({
        message: "No mobileUsers found"
      });
    }
    return res.status(200).json(mobileUsers);
  } catch (err) {
    console.error("Error retrieving mobileUsers:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString()
    });
  }
};

exports.showMobileUser = async (req, res) => { //retrieving single mobileUser
  try {
    const mobileUserId = req.params.id;
    const mobileUser = await MobileUser.findById(mobileUserId);
    if (!mobileUser) {
      return res.status(404).json({
        message: "Mobile user not found"
      });
    }
    if (mobileUser.profileImage) {
      const getObjectParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: mobileUser.profileImage
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      mobileUser.imageUrl = url;
    }
    return res.status(200).json(mobileUser);
  } catch (err) {
    console.error("Error retrieving mobileUser:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString()
    });
  }
};

exports.deleteMobileUser = async (req, res) => { //deleting mobileUser
  try {
    const mobileUserId = req.params.id;
    const mobileUser = await MobileUser.findById(mobileUserId);
    if (!mobileUser) {
      return res.status(404).json({
        message: "Mobile user not found"
      });
    }
    if (mobileUser.profileImage) {
      const deleteObjectParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: mobileUser.profileImage
      };
      const command = new DeleteObjectCommand(deleteObjectParams);
    }
    mobileUser.deleted = true;
    await mobileUser.save();
    return res.status(200).json(
      { message: "Authot deleted" }
    );
  } catch (err) {
    console.error("Error retrieving mobileUser:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString()
    });
  }
};

exports.updateMobileUser = async (req, res) => { //updating mobileUser
  try {
    const mobileUserId = req.params.id;
    const mobileUser = await MobileUser.findById(mobileUserId);
    if (!mobileUser) {
      return res.status(404).json({
        message: "Mobile user not found"
      });
    }
    
    let profileImageName = null;
    if (req.file) {
      profileImageName = await uploadFile(req.file);
      if (mobileUser.profileImage) {
        const deleteObjectParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: mobileUser.profileImage
        };
        const command = new DeleteObjectCommand(deleteObjectParams);
        await s3Client.send(command); 
      }
    }
    
    const { firstname, lastname, username,  email, password, country, mobileNumber, libraries, friends} = req.body;
    const response = await MobileUser.findByIdAndUpdate(mobileUserId, { ...req.body, profilePicture: profileImageName}, { new: true });

    return res.status(200).json({
      message: "Mobile user updated",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

