// controllers\authorController.js
const Author = require("../models/authorModel");
const Book = require("../models/bookModel");
const AuthorAccount = require("../models/authorAccountModel");
const AuthorIncome = require('../models/authorIncomeModel');
const AuthorSocialMedia = require('../models/authorSocialMediaModel');
const uploadFile = require("../middleware/fileUpload/uploadFilesMiddleware");
const s3Client = require("../utils/s3Client");
const { S3Client, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.storeAuthor = async (req, res) => {
  try {
    // Destructure data from the request body
    const { firstname, lastname, died, penName, nationality, firstPublishDate, description, position, addedBooks, accounts } = req.body;

    // Upload the profile image and get the file name
    const profileImageName = await uploadFile(req.file);

    // Create the author record in the database
    const newAuthor = await Author.create({
      firstname,
      lastname,
      died,
      penName,
      nationality,
      firstPublishDate,
      description,
      position,
      profileImage: profileImageName,
    });

    // If author creation is successful, handle related books and accounts
    if (newAuthor) {
      // Handle adding books
      const bookIds = [];
      for (const book of addedBooks) {
        const newBook = await Book.create({
          name: book.added_book_name,
          authorId: newAuthor._id,
          isbn: book.added_book_isbn,
        });
        bookIds.push(newBook._id);
      }

      // Update the author's addedBooks with the new book IDs
      newAuthor.addedBooks = bookIds;
      await newAuthor.save();

      // Handle adding account details
      const accountIds = [];
      for (const account of accounts) {
        const newAccount = await AuthorAccount.create({
          authorId: newAuthor._id,
          name: account.name,
          bank: account.bank,
          branch: account.branch,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          currency: account.currency,
          swiftCode: account.swiftCode || '',
          iban: account.iban || '',
          description: account.description || '',
        });
        accountIds.push(newAccount._id);
      }
      newAuthor.accountDetails = accountIds;
      await newAuthor.save();

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

exports.storeAuthorPayment = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const authorId = req.params.id;

    // Destructure data from the request body
    const { paymentAmount, paymentDate, paymentAccountId, paymentStatus, paymentDescription, invoice } = req.body;

    // Create the author payment record in the database
    const newPayment = await AuthorIncome.create({
      authorId,
      paymentAmount,
      paymentDate,
      paymentAccountId,
      paymentStatus,
      paymentDescription,
      invoice,
    });

    // Update the AuthorAccount to include this new income reference
    await AuthorAccount.findByIdAndUpdate(paymentAccountId, {
      $push: { incomes: newPayment._id },
    });

    // Update the Author to include this new income reference (if needed)
    await Author.findByIdAndUpdate(authorId, {
      income: newPayment._id,
    });

    return res.status(201).json({
      success: true,
      message: "Author payment created successfully",
      data: newPayment,
    });
  } catch (err) {
    console.error("Error creating author payment:", err);
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
    console.log("data");

    const query = {
      isDeleted: false,
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
    console.log("query:", query);

    const authors = await Author.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ firstName: 1 });
    console.log("authors : " + authors);
    const totalItems = await Author.countDocuments(query);
    console.log("count : " + totalItems);
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
    const author = await Author.findById(authorId)
      .populate('addedBooks')
      .populate('accountDetails')
      .populate('income')
      .populate('socialMedia');

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

    const responseData = {
      generalInfo: {
        _id: author._id,
        firstname: author.firstname,
        lastname: author.lastname,
        died: author.died,
        penName: author.penName,
        nationality: author.nationality,
        description: author.description,
        firstPublishDate: author.firstPublishDate,
        profileImage: author.profileImage,
        imageUrl: author.imageUrl || null,
        position: author.position,
        isActive: author.isActive,
        isDeleted: author.isDeleted,
      },
      addedBooks: author.addedBooks,
      accountInfo: author.accountDetails,
      incomeInfo: author.income,
      socialMedia: author.socialMedia,
    };
    // Return the author details
    return res.status(200).json({
      success: true,
      message: "Author retrieved successfully",
      data: responseData,
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


exports.getAuthorBooks = async (req, res) => { //retrieving all data
  try {
    const authorId = req.params.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : '';
    const library = req.query.library ? req.query.library.trim() : '';

    let query = {
      authorId,
      ...(
        search && {
          $or: [
            { name: { $regex: search, $options: 'i' } },
          ],
        }
      ),
    };

    // Add library filter if provided
    if (library) {
      query = {
        ...query,
        library: library  // Assuming "library" is an ObjectId reference
      };
    }

    const books = await Book.find(query)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'library',
        select: 'name',
      })
      .sort({ name: 1 });

    const totalItems = await Book.countDocuments(query);


    // Check if any books were found
    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No books found",
        error: {
          code: "NO_BOOKS_FOUND",
          details: "There are no books available in the database.",
        },
      });
    }

    // Return the list of books
    return res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: books,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error retrieving books:", err);
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


exports.getAuthorPayments = async (req, res) => {
  try {
    const authorId = req.params.id;

    // Construct the query with required authorId and optional query filters
    let query = {
      authorId,
      ...req.query, // Allows filtering by additional query parameters (e.g., paymentStatus)
    };

    // Find payments with the constructed query and sort by paymentDate in descending order
    const payments = await AuthorIncome.find(query).sort({ paymentDate: -1 });

    // Check if any payments were found
    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payments found",
        error: {
          code: "NO_PAYMENTS_FOUND",
          details: "There are no payments available in the database for this author.",
        },
      });
    }

    // Return the list of payments
    return res.status(200).json({
      success: true,
      message: "Payments retrieved successfully",
      data: payments,
    });
  } catch (err) {
    console.error("Error retrieving payments:", err);
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

// author general info update
exports.updateAuthorGeneralInfo = async (req, res) => {
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

// author account info update
exports.updateAuthorAccountInfo = async (req, res) => {
  try {
    const authorId = req.params.id;
    const { accounts } = req.body;

    // console.log("Raw accounts:", accounts);

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

    // Fetch existing accounts for the author
    const existingAccounts = await AuthorAccount.find({ authorId });
    
    // Create a set of existing account IDs for easy lookup
    const existingAccountIds = new Set(existingAccounts.map(account => account._id.toString()));
    
    // Create a set of incoming account IDs to identify which accounts to keep
    const incomingAccountIds = new Set(accounts.map(account => account._id).filter(id => id));

    // Delete accounts that are not present in the incoming data
    for (const account of existingAccounts) {
      if (!incomingAccountIds.has(account._id.toString())) {
        await AuthorAccount.findByIdAndDelete(account._id);
      }
    }

    // Iterate through incoming accounts to update or create
    for (const account of accounts) {
      // console.log(account._id ? 'Updating account' : 'Creating new account', account);

      if (account._id && account._id.trim()) { // If an ID exists, update the account
        await AuthorAccount.findByIdAndUpdate(account._id, {
          name: account.name,
          bank: account.bank,
          branch: account.branch,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          currency: account.currency,
          swiftCode: account.swiftCode || '',
          iban: account.iban || '',
          description: account.description || '',
        }, { new: true });
      } else { // If no ID exists, create a new account
        const newAccount = await AuthorAccount.create({
          authorId,
          name: account.name,
          bank: account.bank,
          branch: account.branch,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          currency: account.currency,
          swiftCode: account.swiftCode || '',
          iban: account.iban || '',
          description: account.description || '',
        });
        author.accountDetails.push(newAccount._id);
      }
    }
    await author.save();

    // Fetch the updated author with the latest accounts (if needed)
    const updatedAuthor = await Author.findById(authorId).populate('accountDetails');
    console.log('Updated author data:', updatedAuthor);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Author's account details updated successfully",
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
