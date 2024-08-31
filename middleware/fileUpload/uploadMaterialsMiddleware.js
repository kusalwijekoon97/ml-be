// middleware/fileUpload/uploadMaterialsMiddleware.js
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});
require('dotenv').config();

const uploadMaterials = async (req, res, next) => {
  try {
    const files = req.files || [];
    const fileUrls = [];

    await Promise.all(Object.values(files).flat().map((file) => {
      return new Promise((resolve, reject) => {
        let extension = file.originalname.split('.').pop();
        let contentType = {
          pdf: 'application/pdf',
          epub: 'application/epub+zip',
          mp3: 'audio/mpeg',
          txt: 'text/plain',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
        }[extension] || 'application/octet-stream';

        const fileName = Date.now().toString() + Math.random() * 10000 + `.${extension}`;
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          ContentType: contentType,
          Key: fileName,
          Body: file.buffer,
        };

        s3.upload(params, (err, data) => {
          if (err) return reject(err);
          const fileURL = data.Location;
          fileUrls.push(fileURL);
          resolve();
        });
      });
    }));
    
    req.awsFiles = fileUrls;
    next();
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
};

module.exports = uploadMaterials;
