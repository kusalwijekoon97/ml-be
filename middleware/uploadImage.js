require('dotenv').config();
const fs = require("fs");
const AWS = require("aws-sdk");

exports.uploadImages = (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => ({ ...file }));

      const imagesUrl = [];
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        Bucket: process.env.AWS_BUCKET_NAME,
      });

      images.forEach((item) => {
        let extension = item.originalname.split(".").pop();
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          ContentType: item.mimetype, // ensure correct MIME type
          Key: `${Date.now()}-${Math.random() * 10000}.${extension}`,
          Body: item.buffer,
        };

        s3.upload(params, (err, data) => {
          if (err) {
            const error = new Error(err);
            error.statusCode = 500;
            throw error;
          } else {
            imagesUrl.push(data.Location);
            if (imagesUrl.length === images.length) {
              req.awsImages = imagesUrl;
              next();
            }
          }
        });
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.toString(),
    });
  }
};
