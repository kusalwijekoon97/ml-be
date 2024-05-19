// author controller
const Author = require("../models/Author");
const uploadImage = require("../middleware/uploadImageMiddleware");
const s3Client = require("../s3Client");
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.storeAuthor = async (req, res) => { //storing an author
  try {
    const { firstname, lastname, died, penName, nationality, description, firstPublishDate, position, income } = req.body;
    const profileImageName = await uploadImage(req.file);

    const response = await Author.create({ ...req.body, profileImage: profileImageName });
    if (response) {
      return res.status(200).json({
        message: "Author Created",
      });
    } else {
      return res.status(400).json({
        message: "Author Creation failed.",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getAllAuthors = async (req, res) => { //retrieving all data
  try {
    const authors = await Author.find({ deleted: false });

    for (const author of authors) {
      if (!author.profileImage) {
        continue;
      }

      const getObjectParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: author.profileImage
      };

      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      author.imageUrl = url;
    }

    if (authors.length === 0) {
      return res.status(400).json({
        message: "No authors found"
      });
    }
    return res.status(200).json(authors);
  } catch (err) {
    console.error("Error retrieving authors:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString()
    });
  }
};

exports.getSingleAuthor = async (req, res) => { //retrieving single author
  try {
    const authorId = req.params.id;
    const author = await Author.findById(authorId);
    if (!author) {
      return res.status(404).json({
        message: "Author not found"
      });
    }
    if (author.profileImage) {
      const getObjectParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: author.profileImage
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      author.imageUrl = url;
    }
    return res.status(200).json(author);
  } catch (err) {
    console.error("Error retrieving author:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString()
    });
  }
};

exports.deleteAuthor = async (req, res) => { //deleting author
  try {
    const authorId = req.params.id;
    const author = await Author.findById(authorId);
    if (!author) {
      return res.status(404).json({
        message: "Author not found"
      });
    }
    if (author.profileImage) {
      const deleteObjectParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: author.profileImage
      };
      const command = new DeleteObjectCommand(deleteObjectParams);
    }
    author.deleted = true;
    await author.save();
    return res.status(200).json(
      { message: "Authot deleted" }
    );
  } catch (err) {
    console.error("Error retrieving author:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString()
    });
  }
};

exports.updateAuthor = async (req, res) => { //updating author
  try {
    const authorId = req.params.id;
    const author = await Author.findById(authorId);
    if (!author) {
      return res.status(404).json({
        message: "Author not found"
      });
    }
    
    let profileImageName = null;
    if (req.file) {
      profileImageName = await uploadImage(req.file);
      if (author.profileImage) {
        const deleteObjectParams = {
          Bucket: process.env.BUCKET_NAME,
          Key: author.profileImage
        };
        const command = new DeleteObjectCommand(deleteObjectParams);
        await s3Client.send(command); 
      }
    }
    
    const { firstname, lastname, died, penName, nationality, description, firstPublishDate, position, income } = req.body;
    const response = await Author.findByIdAndUpdate(authorId, { ...req.body, profileImage: profileImageName }, { new: true });

    return res.status(200).json({
      message: "Author updated",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

