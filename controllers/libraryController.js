// controllers/libraryController.js
const Librarian = require("../models/librarianModel");
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
    .populate('librarian')
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
    const library = await Library.findById(libraryId)
    .populate({
      path: 'librarian',
      select: '_id firstName lastName',
    });
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
    const { name, librarian } = req.body;

    // Check if the library ID is provided
    if (!libraryId) {
      return res.status(400).json({
        success: false,
        message: "Library ID not found",
        error: {
          code: "LIBRARY_ID_NOT_FOUND",
          details: "Please provide a valid library ID."
        },
      });
    }

    // Check if a library with the same name already exists (excluding the current one)
    const libraryExists = await Library.findOne({ name });
    if (libraryExists && libraryExists._id.toString() !== libraryId) {
      return res.status(400).json({
        success: false,
        message: "Cannot rename the library to this name",
        error: {
          code: "LIBRARY_NAME_EXISTS",
          details: `A library with the name '${name}' already exists.`,
        },
      });
    }

    // Update the library
    const updatedLibrary = await Library.findByIdAndUpdate(
      libraryId,
      { name, librarian },
      { new: true }
    );

    // If the library was not found
    if (!updatedLibrary) {
      return res.status(404).json({
        success: false,
        message: "Library not found",
        error: {
          code: "LIBRARY_NOT_FOUND",
          details: "The library with the specified ID does not exist."
        },
      });
    }

    // Update the librarian to have this library (if applicable)
    if (librarian) {
      const librarianDoc = await Librarian.findById(librarian);
      if (librarianDoc) {
        if (!librarianDoc.libraries.includes(libraryId)) {
          librarianDoc.libraries.push(libraryId);
          await librarianDoc.save();
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Library updated successfully",
      library: updatedLibrary,
    });
  } catch (error) {
    console.error("Error updating library:", error);
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



exports.deleteLibrary = async (req, res) => {
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

    // Mark the library as deleted
    library.deleted = true;
    await library.save();

    return res.status(200).json({
      success: true,
      message: "Library deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting library:", error);
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


exports.changeStatus = async (req, res) => {
  try {
    const libraryId = req.params.id;

    // Validate that the library ID is provided
    if (!libraryId) {
      return res.status(400).json({
        success: false,
        message: "Library ID is required",
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

    // Toggle the is_active status
    library.is_active = !library.is_active;
    await library.save();

    return res.status(200).json({
      success: true,
      message: "Library status changed successfully",
      data: {
        libraryId: library._id,
        is_active: library.is_active,
      },
    });
  } catch (error) {
    console.error("Error changing library status:", error);
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


// open --------------------------------------------------------------------

exports.getOpenAllLibraries = async (req, res) => {
  try {

    // Fetch active libraries, sorted by name in ascending order
    const libraries = await Library.find({deleted:false})
    .sort({ name: 1 });

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
      data: libraries
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