require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const getContentType = (extension) => {
  switch (extension.toLowerCase()) {
    case 'pdf':
      return 'application/pdf';
    case 'epub':
      return 'application/epub+zip';
    case 'mp3':
      return 'audio/mpeg';
    case 'txt':
      return 'text/plain';
    // Add more cases for other file types if needed
    default:
      return 'application/octet-stream'; // Default content type
  }
};

exports.uploadFiles = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      const fileUploadPromises = req.files.map((file) => {
        const extension = file.originalname.split('.').pop();
        const contentType = getContentType(extension);

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          ContentType: contentType,
          Key: `${Date.now()}-${Math.random() * 10000}.${extension}`,
          Body: file.buffer,
        };

        return s3.upload(params).promise();
      });

      const results = await Promise.all(fileUploadPromises);
      req.awsFiles = results.map((result) => result.Location);
      next();
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.toString(),
    });
  }
};
