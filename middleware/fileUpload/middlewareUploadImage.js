const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const s3Client = require("../../utils/s3Client");

const storage = multer.memoryStorage();

const uploadSingleImage = async (file) => {
  try {
    const imageBuffer = await sharp(file.buffer).resize({ height: 200, width: 200, fit: "cover" }).toBuffer();
    const imageName = uuidv4();
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${imageName}.jpg`,
      Body: imageBuffer,
      ContentType: file.mimetype
    };
    await s3Client.send(new PutObjectCommand(params));
    const s3Url = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${imageName}.jpg`;
    return s3Url;
  } catch (error) {
    throw new Error("Error uploading image: " + error.message);
  }
};

const uploadMultipleImages = async (files) => {
  try {
    if (!files || files.length === 0) {
      return []; // Handle cases where no images are uploaded
    }

    const imageUrls = await Promise.all(
      files.map(async (file) => uploadSingleImage(file))
    );
    return imageUrls;
  } catch (error) {
    throw new Error("Error uploading multiple images: " + error.message);
  }
};

const uploadMiddleware = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image")) {
      return cb(new Error("Please upload image files only."));
    }
    cb(null, true);
  }
});

module.exports = {
  singleImageUpload: uploadMiddleware.single("coverImage"),
  multipleImageUpload: uploadMiddleware.array("additionalImages")
};
