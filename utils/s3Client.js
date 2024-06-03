// utils\s3Client.js
const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

const BUCKET_REGION = process.env.S3_BUCKET_REGION;
const ACCESS_KEY = process.env.S3_ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY
  },
  region: BUCKET_REGION
});

module.exports = s3Client;
