// controllers/libraryController.js
const Library = require("../models/libraryModel");

exports.storeLibrary = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if a library with the same name already exists
    const libraryExists = await Library.findOne({ name });
    if (libraryExists) {
      return res.status(400).json({
        success: false,
        message: "Cannot add another library with the same name",
        error: {
          code: "LIBRARY_EXISTS",
          details: `A library with the name '${name}' already exists.`,
        },
      });
    }

    // Create a new library
    const response = await Library.create({ name });
    if (response) {
      return res.status(201).json({
        success: true,
        message: "Library created successfully",
        library: response,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Library creation failed",
        error: {
          code: "LIBRARY_CREATION_FAILED",
          details: "An unknown error occurred during library creation.",
        },
      });
    }
  } catch (err) {
    console.error("Error creating library:", err);
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


exports.getAllLibraries = async (req, res) => {
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
            { name: { $regex: search, $options: 'i' } }
          ],
        }
      ),
    };

    // Fetch active libraries, sorted by name in ascending order
    const libraries = await Library.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ name: 1 });

    const totalItems = await Library.countDocuments(query);

    // Check if no libraries were found
    if (libraries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No libraries found",
        error: {
          code: "LIBRARIES_NOT_FOUND",
          details: "No active libraries are available in the system.",
        },
      });
    }

    // Return the list of libraries
    return res.status(200).json({
      success: true,
      message: "Libraries retrieved successfully",
      data: libraries,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error retrieving libraries:", err);
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


exports.showLibrary = async (req, res) => {
  try {
    const libraryId = req.params.id;

    // Validate that the library ID is provided
    if (!libraryId) {
      return res.status(400).json({
        success: false,
        message: "Library ID not provided",
        error: {
          code: "LIBRARY_ID_MISSING",
          details: "A valid library ID must be provided in the request parameters.",
        },
      });
    }

    // Find the library by ID
    const library = await Library.findById(libraryId);
    if (!library) {
      return res.status(404).json({
        success: false,
        message: "Library not found",
        error: {
          code: "LIBRARY_NOT_FOUND",
          details: `No library found with the ID ${libraryId}.`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Library retrieved successfully",
      data: library,
    });
  } catch (error) {
    console.error("Error retrieving library:", error);
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


exports.updateLibrary = async (req, res) => {
  try {
    const libraryId = req.params.id;
    const { name } = req.body;
    if (!libraryId) {
      return res.status(400).json({
        message: "Library ID not found",
      });
    }
    const libraryExists = await Library.findOne({ name });
    if (libraryExists && libraryExists._id != libraryId) {
      return res.status(400).json({
        message: "Library name already exists",
      });
    }
    const response = await Library.findByIdAndUpdate(
      libraryId,
      { name },
      { new: true }
    );
    if (!response) {
      return res.status(400).json({
        message: "Library not found",
      });
    }
    return res.status(200).json({
      message: "Library updated",
      library: response
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


exports.deleteLibrary = async (req, res) => {
  try {
    const libraryId = req.params.id;
    const library = await Library.findById(libraryId);
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }
    library.is_active = false;
    await library.save();
    return res.status(200).json({ message: "Library deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
