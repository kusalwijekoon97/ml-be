// controllers/libraryController.js
const Library = require("../models/libraryModel");

exports.storeLibrary = async (req, res) => {
  try {
    const { name } = req.body;
    const libraryExists = await Library.findOne({ name });
    if (libraryExists) {
      return res.status(400).json({
        message: "Cannot add another library with the same name",
      });
    }
    const response = await Library.create({ name });
    if (response) {
      return res.status(200).json({
        message: "Library Created",
        library: response
      });
    } else {
      return res.status(400).json({
        message: "Library Creation failed.",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getAllLibraries = async (req, res) => {
  try {
    const libraries = await Library.find({ is_active: true }).sort({ name: 1 });
    if (libraries.length === 0) {
      return res.status(400).json({
        message: "No libraries found",
      });
    }
    return res.status(200).json(libraries);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.showLibrary = async (req, res) => {
  try {
    const libraryId = req.params.id;
    if (!libraryId) {
      return res.status(400).json({
        message: "Library ID not provided",
      });
    }
    const library = await Library.findById(libraryId);
    if (!library) {
      return res.status(404).json({
        message: "Library not found",
      });
    }
    return res.status(200).json(library);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
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
