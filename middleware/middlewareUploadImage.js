// imageUpload middleware
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const s3Client = require("../s3Client");

const storage = multer.memoryStorage();

const imageUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image")) {
      return cb(new Error("Please upload an image file."));
    }
    cb(null, true);
  }
});

const uploadImage = async (file) => {
  try {
    const profileImageBuffer = await sharp(file.buffer).resize({ height: 200, width: 200, fit: "cover" }).toBuffer();
    const imageName = uuidv4();
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${imageName}.jpg`,
      Body: profileImageBuffer,
      ContentType: file.mimetype
    };
    await s3Client.send(new PutObjectCommand(params));
    const s3Url = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${imageName}.jpg`;
    return `s3Url`; // Assuming you have a base URL for S3
  } catch (error) {
    throw new Error("Error uploading image: " + error.message);
  }
};

// module.exports = imageUpload.single("coverImage"), async (req, res, next) => {
//   try {
//     req.body.coverImage = await uploadImage(req.file);
//     next();
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

module.exports = uploadImage;