// controllers\dashboardController.js

const Author = require("../models/authorModel");
const Librarian = require("../models/librarianModel");

exports.getDashboardCounts = async (req, res) => {
  try {
    const countAuthors = await Author.countDocuments({ deleted: false, is_active: true });
    const countLibrarians = await Librarian.countDocuments({ deleted: false, is_active: true });

    // Send the counts in the response
    return res.status(200).json({
      success: true,
      message: "Dashboard counts retrieved successfully",
      data: {
        countAuthors: countAuthors,
        countLibrarians: countLibrarians,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving dashboard counts",
      error: {
        code: "SERVER_ERROR",
        details: err.message,
      },
    });
  }
};
