// textUpload middleware
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require('uuid');
const s3Client = require("../s3Client");
require("dotenv").config();

const textUpload = async (file) => {
  try {
    // Generate a unique file name for the text file
    const generateUniqueFileName = () => Buffer.from(uuidv4() + Date.now().toString()).toString('hex');

    // Upload the text file to S3 bucket
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: generateUniqueFileName(), // Use a unique file name
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Return the unique file name generated for the uploaded text file
    return params.Key;
  } catch (error) {
    throw new Error("Error uploading text file: " + error.message);
  }
};

module.exports = textUpload;
