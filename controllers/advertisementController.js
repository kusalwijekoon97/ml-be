// controllers\advertisementController.js
const Advertisement = require("../models/advertisementModel");
const uploadFile = require("../middleware/fileUpload/uploadFilesMiddleware");
const s3Client = require("../utils/s3Client");
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.storeAdvertisement = async (req, res) => { //storing an advertisement
  try {
    const advertisementImageName = await uploadFile(req.file);

    const response = await Advertisement.create({ advertisement: advertisementImageName });
    if (response) {
      return res.status(200).json({
        message: "Advertisement Created",
      });
    } else {
      return res.status(400).json({
        message: "Advertisement Creation failed.",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getAllAdvertisements = async (req, res) => { //retrieving all data
  try {
    const advertisements = await Advertisement.find({ deleted: false });

    for (const advertisement of advertisements) {
      if (!advertisement.advertisement) {
        continue;
      }

      const getObjectParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: advertisement.advertisement
      };

      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      advertisement.imageUrl = url;
    }

    if (advertisements.length === 0) {
      return res.status(400).json({
        message: "No advertisements found"
      });
    }
    return res.status(200).json(advertisements);
  } catch (err) {
    console.error("Error retrieving advertisements:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString()
    });
  }
};

exports.showAdvertisement = async (req, res) => { //retrieving single advertisement
  try {
    const advertisementId = req.params.id;
    const advertisement = await Advertisement.findById(advertisementId);
    if (!advertisement) {
      return res.status(404).json({
        message: "Advertisement not found"
      });
    }
    if (advertisement.advertisement) {
      const getObjectParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: advertisement.advertisement
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      advertisement.imageUrl = url;
    }
    return res.status(200).json(advertisement);
  } catch (err) {
    console.error("Error retrieving advertisement:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString()
    });
  }
};

exports.deleteAdvertisement = async (req, res) => { //deleting advertisement
  try {
    const advertisementId = req.params.id;
    const advertisement = await Advertisement.findById(advertisementId);
    if (!advertisement) {
      return res.status(404).json({
        message: "Advertisement not found"
      });
    }
    if (advertisement.advertisement) {
      const deleteObjectParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: advertisement.advertisement
      };
      const command = new DeleteObjectCommand(deleteObjectParams);
    }
    advertisement.deleted = true;
    await advertisement.save();
    return res.status(200).json(
      { message: "Authot deleted" }
    );
  } catch (err) {
    console.error("Error retrieving advertisement:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString()
    });
  }
};

exports.updateAdvertisement = async (req, res) => { //updating advertisement
  try {
    const advertisementId = req.params.id;
    const advertisement = await Advertisement.findById(advertisementId);
    if (!advertisement) {
      return res.status(404).json({
        message: "Advertisement not found"
      });
    }
    
    let advertisementImageName = null;
    if (req.file) {
      advertisementImageName = await uploadFile(req.file);
      if (advertisement.advertisement) {
        const deleteObjectParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: advertisement.advertisement
        };
        const command = new DeleteObjectCommand(deleteObjectParams);
        await s3Client.send(command); 
      }
    }
    const response = await Advertisement.findByIdAndUpdate(advertisementId, {advertisement: advertisementImageName }, { new: true });

    return res.status(200).json({
      message: "Advertisement updated",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

