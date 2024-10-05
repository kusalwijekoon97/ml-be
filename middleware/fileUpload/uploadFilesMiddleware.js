// middleware/fileUpload/uploadFileMiddleware.js
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const s3Client = require("../../utils/s3Client");
const path = require('path'); // Import path module
require("dotenv").config();

const uploadFiles = async (files) => {
  try {
    if (!files || files.length === 0) {
      throw new Error("No files selected.");
    }

    const generateFileName = (extension) => {
      const uuidPart = uuidv4().replace(/-/g, '').slice(0, 10);
      const timestampPart = Date.now().toString().slice(-6);
      return `${uuidPart}${timestampPart}${extension}`; // Append extension
    };

    const uploadFile = async (file) => {
      let fileBuffer = file.buffer;
      let fileExtension = path.extname(file.originalname); // Get the original file extension

      if (file.mimetype.startsWith('image/')) {
        // Resize the image if it's an image file
        fileBuffer = await sharp(file.buffer).resize({ height: 200, width: 200, fit: "cover" }).toBuffer();
      }

      const fileName = generateFileName(fileExtension); // Pass extension to generateFileName
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.mimetype
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      const fileURL = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${fileName}`;
      return fileURL;
    };

    if (Array.isArray(files)) {
      const uploadPromises = files.map(uploadFile);
      const fileURLs = await Promise.all(uploadPromises);
      return fileURLs;
    } else {
      const fileURL = await uploadFile(files);
      return fileURL;
    }
  } catch (error) {
    throw new Error("Error uploading files: " + error.message);
  }
};

module.exports = uploadFiles;