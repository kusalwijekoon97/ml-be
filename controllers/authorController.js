// controllers\authorController.js
const Author = require("../models/authorModel");
const uploadFile = require("../middleware/fileUpload/uploadFilesMiddleware");
const s3Client = require("../utils/s3Client");
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.storeAuthor = async (req, res) => {
  try {
    const { firstname, lastname, died, penName, nationality, description, firstPublishDate, position, income } = req.body;
    // Upload the profile image and get the file name
    const profileImageName = await uploadFile(req.file);
    // Create the author record in the database
    const newAuthor = await Author.create({
      firstname,
      lastname,
      died,
      penName,
      nationality,
      description,
      firstPublishDate,
      position,
      income,
      profileImage: profileImageName,
    });
    if (newAuthor) {
      return res.status(201).json({
        success: true,
        message: "Author created successfully",
        data: newAuthor,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Author creation failed",
        error: {
          code: "AUTHOR_CREATION_FAILED",
          details: "The author could not be created due to an unknown issue.",
        },
      });
    }
  } catch (err) {
    console.error("Error creating author:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: err.message,
      },
    });
  }
};


exports.getAllAuthors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : '';

    const query = {
      deleted: false,
      ...(
        search && {
          $or: [
            { firstname: { $regex: search, $options: 'i' } },
            { lastname: { $regex: search, $options: 'i' } },
            { penName: { $regex: search, $options: 'i' } },
          ],
        }
      ),
    };

    const authors = await Author.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ firstName: 1 });

    const totalItems = await Author.countDocuments(query);

    // Generate a signed URL for each author's profile image
    for (const author of authors) {
      if (author.profileImage) {
        const getObjectParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: author.profileImage,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        author.imageUrl = url;
      }
    }

    // Check if any authors were found
    if (authors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No authors found",
        error: {
          code: "NO_AUTHORS_FOUND",
          details: "There are no authors available in the database.",
        },
      });
    }

    // Return the list of authors
    return res.status(200).json({
      success: true,
      message: "Authors retrieved successfully",
      data: authors,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error retrieving authors:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: err.message,
      },
    });
  }
};

exports.getOpenAllAuthors = async (req, res) => {
  try {
    const authors = await Author.find({ deleted: false })
      .sort({ firstname: 1 })
      .select('firstname lastname _id');

    // Check if no authors were found
    if (authors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No authors found",
        error: {
          code: "AUTHORS_NOT_FOUND",
          details: "No active authors are available in the system.",
        },
      });
    }

    // Return the list of authors
    return res.status(200).json({
      success: true,
      message: "Authors retrieved successfully",
      data: authors
    });
  } catch (err) {
    console.error("Error retrieving authors:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: err.message,
      },
    });
  }
};

exports.showAuthor = async (req, res) => {
  try {
    const authorId = req.params.id;
    // Find the author by ID
    const author = await Author.findById(authorId);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found",
        error: {
          code: "AUTHOR_NOT_FOUND",
          details: "The author with the provided ID does not exist.",
        },
      });
    }

    // Generate a signed URL for the author's profile image if it exists
    if (author.profileImage) {
      const getObjectParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: author.profileImage,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      author.imageUrl = url;
    }

    // Return the author details
    return res.status(200).json({
      success: true,
      message: "Author retrieved successfully",
      data: author,
    });
  } catch (err) {
    console.error("Error retrieving author:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: err.message,
      },
    });
  }
};


exports.deleteAuthor = async (req, res) => {
  try {
    const authorId = req.params.id;

    // Find the author by ID
    const author = await Author.findById(authorId);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found",
        error: {
          code: "AUTHOR_NOT_FOUND",
          details: "The author with the provided ID does not exist.",
        },
      });
    }

    // If the author has a profile image, delete it from S3
    if (author.profileImage) {
      const deleteObjectParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: author.profileImage,
      };
      const command = new DeleteObjectCommand(deleteObjectParams);
      await s3Client.send(command);
    }

    // Mark the author as deleted (soft delete)
    author.deleted = true;
    await author.save();

    return res.status(200).json({
      success: true,
      message: "Author deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting author:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: err.message,
      },
    });
  }
};


exports.updateAuthor = async (req, res) => {
  try {
    const authorId = req.params.id;

    // Find the author by ID
    const author = await Author.findById(authorId);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found",
        error: {
          code: "AUTHOR_NOT_FOUND",
          details: "The author with the provided ID does not exist.",
        },
      });
    }

    // Handle profile image upload if a new file is provided
    let profileImageName = author.profileImage; // Preserve existing image if no new file is uploaded
    if (req.file) {
      // Upload the new profile image
      profileImageName = await uploadFile(req.file);

      // Delete the old profile image from S3 if it exists
      if (author.profileImage) {
        const deleteObjectParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: author.profileImage,
        };
        const command = new DeleteObjectCommand(deleteObjectParams);
        await s3Client.send(command);
      }
    }

    // Update the author with the new details
    const updatedAuthor = await Author.findByIdAndUpdate(
      authorId,
      { ...req.body, profileImage: profileImageName },
      { new: true }
    );

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Author updated successfully",
      data: updatedAuthor,
    });
  } catch (error) {
    console.error("Error updating author:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: error.message,
      },
    });
  }
};


exports.changeStatusAuthor = async (req, res) => {
  try {
    const authorId = req.params.id;

    // Validate that the author ID is provided
    if (!authorId) {
      return res.status(400).json({
        success: false,
        message: "Author ID is required",
        error: {
          code: "AUTHOR_ID_MISSING",
          details: "A valid author ID must be provided in the request parameters.",
        },
      });
    }

    // Find the author by ID
    const author = await Author.findById(authorId);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found",
        error: {
          code: "AUTHOR_NOT_FOUND",
          details: `No author found with the ID ${authorId}.`,
        },
      });
    }

    // Toggle the is_active status
    author.is_active = !author.is_active;
    await author.save();

    return res.status(200).json({
      success: true,
      message: "Author status changed successfully",
      data: {
        authorId: author._id,
        is_active: author.is_active
      },
    });
  } catch (error) {
    console.error("Error changing author status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: error.message,
      },
    });
  }
};
