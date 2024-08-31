const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "video/mp4",
        "application/pdf",
        "text/plain",
        "application/epub+zip",
        "audio/mpeg"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
