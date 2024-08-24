// controllers\librarianController.js
const fs = require("fs");
const path = require("path");
const Librarian = require("../models/librarianModel");
const bcrypt = require("bcryptjs");
const emailTransporter = require("../utils/emailTransporter");
const { log } = require("console");
const Library = require("../models/libraryModel");
require('dotenv').config();

const generateRandomCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};


exports.storeLibrarian = async (req, res) => {
  try {
    const { email, phone, firstName, lastName, nic, address, library, permissions } = req.body;

    console.log(req.body);

    // Ensure email and phone are provided
    if (!email || !phone || !firstName || !lastName || !nic) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (firstName, lastName, nic, email, phone).",
        error: {
          code: "MISSING_FIELDS",
          details: "Some required fields are missing from the request body.",
        },
      });
    }

    const lowerCaseEmail = email.toLowerCase();

    // Check for existing librarian with the same email
    const existingLibrarianByEmail = await Librarian.findOne({ email: lowerCaseEmail });
    if (existingLibrarianByEmail) {
      return res.status(400).json({
        success: false,
        message: "Librarian with the same email already exists",
        error: {
          code: "EMAIL_CONFLICT",
          details: "A librarian with this email address already exists.",
        },
      });
    }

    // Check for existing librarian with the same phone number
    const existingLibrarianByPhone = await Librarian.findOne({ phone });
    if (existingLibrarianByPhone) {
      return res.status(400).json({
        success: false,
        message: "Librarian with the same phone number already exists",
        error: {
          code: "PHONE_CONFLICT",
          details: "A librarian with this phone number already exists.",
        },
      });
    }

    const rndmPassword = generateRandomCode();
    // console.log(rndmPassword);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(rndmPassword, saltRounds);

    // Create new librarian with hashed password
    const newLibrarian = new Librarian({
      firstName,
      lastName,
      nic,
      email: lowerCaseEmail,
      address,
      phone,
      password: hashedPassword,
      libraries: library,
      permissions: permissions || {}
    });
    await newLibrarian.save();

    // Update existing libraries with the new librarian
    if (library && library.length > 0) {
      // Update all libraries assigned to the new librarian
      await Library.updateMany(
        { _id: { $in: library } },
        { $set: { librarian: newLibrarian._id } }
      );
      // Optionally, clear the librarian field in other libraries if needed
      // This step is optional based on your requirements
      await Library.updateMany(
        { librarian: newLibrarian._id, _id: { $nin: library } },
        { $set: { librarian: null } }
      );
    }

    // Load the HTML email template
    const templatePath = path.join(__dirname, '../src/emails/create_librarian.html');
    let emailHtml = fs.readFileSync(templatePath, 'utf8');
    // Replace placeholders with actual data
    emailHtml = emailHtml.replace('{{firstName}}', firstName)
      .replace('{{lastName}}', lastName)
      .replace('{{email}}', lowerCaseEmail)
      .replace('{{password}}', rndmPassword);

    // Send email with librarian data and password
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: lowerCaseEmail,
      subject: 'Welcome to My Library',
      html: emailHtml
    };

    emailTransporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return res.status(201).json({
      success: true,
      message: "Librarian created successfully",
      data: newLibrarian,
    });
  } catch (err) {
    console.error("Error creating librarian:", err);
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


exports.getAllLibrarians = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : '';

    const query = search
      ? {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { nic: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }
      : {};

    const librarians = await Librarian.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ firstName: 1 })
      .select("-password -otpCode -emailCode -passwordRecoveryToken");

    const totalItems = await Librarian.countDocuments();

    if (librarians.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No librarians found",
        error: {
          code: "NO_LIBRARIANS_FOUND",
          details: "There are currently no librarians available in the database.",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: librarians,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error retrieving librarians:", err);
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


exports.getLibrariansByLibrary = async (req, res) => {
  try {
    Librarian.find({ libraries: { $in: req.body.libraries }, firstName: 1 })
      .populate("libraries")
      .select("-password -otpCode -emailCode -passwordRecoveryToken")
      //   .populate("plan libraries")
      .then((librarians) => {
        res.status(200).json(librarians);
      });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};


exports.showLibrarian = async (req, res) => {
  try {
    const librarianId = req.params.id;

    // Find the librarian by ID
    const librarian = await Librarian.findById(librarianId)
      .populate({
        path: 'libraries',
        select: '_id name',
      })
      .select("-password -otpCode -emailCode -passwordRecoveryToken"); // Exclude sensitive fields

    // Check if the librarian exists
    if (!librarian) {
      return res.status(404).json({
        success: false,
        message: "Librarian not found",
        error: {
          code: "LIBRARIAN_NOT_FOUND",
          details: "The librarian with the provided ID does not exist.",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Librarian retrieved successfully",
      data: librarian,
    });
  } catch (err) {
    console.error("Error retrieving librarian:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        details: err.toString(),
      },
    });
  }
};


exports.deleteLibrarian = async (req, res) => {
  try {
    const librarianId = req.params.id;

    // Find the librarian by ID
    const librarian = await Librarian.findById(librarianId);
    if (!librarian) {
      return res.status(404).json({
        success: false,
        message: "Librarian not found",
        error: {
          code: "LIBRARIAN_NOT_FOUND",
          details: "The librarian with the provided ID does not exist.",
        },
      });
    }

    // Mark the librarian as deleted (soft delete)
    librarian.deleted = true;
    await librarian.save();

    return res.status(200).json({
      success: true,
      message: "Librarian deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting librarian:", err);
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


exports.updateLibrarian = async (req, res) => {
  try {
    const librarianId = req.params.id;
    const { email, phone, firstName, lastName, nic, address, libraries, permissions } = req.body;

    // Check if the librarian exists
    const librarian = await Librarian.findById(librarianId);
    if (!librarian) {
      return res.status(404).json({
        success: false,
        message: "Librarian not found",
        error: {
          code: "LIBRARIAN_NOT_FOUND",
          details: "The librarian with the provided ID does not exist.",
        },
      });
    }

    // Check for existing librarian with the same email
    if (email && email.toLowerCase() !== librarian.email) {
      const existingLibrarianByEmail = await Librarian.findOne({ email: email.toLowerCase() });
      if (existingLibrarianByEmail) {
        return res.status(400).json({
          success: false,
          message: "Librarian with the same email already exists",
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            details: "A librarian with this email address already exists.",
          },
        });
      }
    }

    // Check for existing librarian with the same phone number
    if (phone && phone !== librarian.phone) {
      const existingLibrarianByPhone = await Librarian.findOne({ phone });
      if (existingLibrarianByPhone) {
        return res.status(400).json({
          success: false,
          message: "Librarian with the same phone number already exists",
          error: {
            code: "PHONE_ALREADY_EXISTS",
            details: "A librarian with this phone number already exists.",
          },
        });
      }
    }

    // Validate required fields
    if (!firstName || !lastName || !nic || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (firstName, lastName, nic, email, phone).",
        error: {
          code: "MISSING_FIELDS",
          details: "One or more required fields are missing.",
        },
      });
    }

    // Update librarian details
    librarian.firstName = firstName;
    librarian.lastName = lastName;
    librarian.nic = nic;
    librarian.email = email.toLowerCase();
    librarian.address = address;
    librarian.phone = phone;

    // Update associated libraries
    if (libraries && libraries.length > 0) {
      const libraryIds = libraries.map(lib => lib.value); // Extract only the ObjectId values

      // Assign the librarian to the provided libraries
      await Library.updateMany(
        { _id: { $in: libraryIds } },
        { $set: { librarian: librarian._id } }
      );
      // Clear the librarian field from other libraries
      await Library.updateMany(
        { librarian: librarian._id, _id: { $nin: libraryIds } },
        { $set: { librarian: null } }
      );

      // Assign the new libraryIds to the librarian
      librarian.libraries = libraryIds;
    }

    if (permissions) {
      librarian.permissions = permissions; // Assuming permissions is an object or array as needed
    }

    // Save the updated librarian
    await librarian.save();

    return res.status(200).json({
      success: true,
      message: "Librarian updated successfully",
      data: librarian,
    });
  } catch (error) {
    console.error("Error updating librarian:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "SERVER_ERROR",
        details: error.toString(),
      },
    });
  }
};





exports.changeStatus = async (req, res) => {
  try {
    const librarianId = req.params.id;

    // Validate that the librarian ID is provided
    if (!librarianId) {
      return res.status(400).json({
        success: false,
        message: "Librarian ID is required",
        error: {
          code: "LIBRARIAN_ID_MISSING",
          details: "A valid librarian ID must be provided in the request parameters.",
        },
      });
    }

    // Find the librarian by ID
    const librarian = await Librarian.findById(librarianId);
    if (!librarian) {
      return res.status(404).json({
        success: false,
        message: "Librarian not found",
        error: {
          code: "LIBRARIAN_NOT_FOUND",
          details: `No librarian found with the ID ${librarianId}.`,
        },
      });
    }

    // Toggle the is_active status
    librarian.is_active = !librarian.is_active;
    await librarian.save();

    return res.status(200).json({
      success: true,
      message: "Librarian status changed successfully",
      data: {
        librarianId: librarian._id,
        is_active: librarian.is_active,
      },
    });
  } catch (error) {
    console.error("Error changing librarian status:", error);
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



// exports.updatePlan = (req, res, next) => {
//   try {
//     const { librarianId, plans } = req.body;

//     plans.map(async (obj) => {
//       Librarian.findById(librarianId)
//         .populate("plans.plan")
//         .then(async (librarian) => {
//           if (librarian.plans.length > 0) {
//             const dbPlan = await Plan.findById(obj.plan);
//             const index = librarian.plans.findIndex((plan) =>
//               plan.plan.library.equals(dbPlan.library)
//             );
//             if (index === -1) {
//               librarian.plans = [...librarian.plans, obj];
//             } else {
//               let tempPlan = {
//                 plan: librarian.plans[index].plan._id,
//                 active: false,
//               };
//               librarian.oldPlans = [...librarian.oldPlans, tempPlan];
//               librarian.plans[index] = obj;
//             }
//             Sales.create(
//               {
//                 librarian: librarianId,
//                 plan: obj.plan,
//                 amount: dbPlan.price,
//               },
//               async (err, doc) => {
//                 await librarian.save();
//               }
//             );
//           } else {
//             librarian.plans = plans;
//             await librarian.save();
//             return res.status(200).json({
//               message: "Plan Upgraded",
//             });
//           }
//         })
//         .catch((err) => {
//           res.status(400).json({
//             message: err,
//           });
//         });
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// };


exports.searchLibrarians = async (req, res) => {
  try {
    // console.log(`req.body`, req.body);
    Librarian.find({
      $or: [
        { firstName: { $regex: req.body.name, $options: "i" } },
        { lastName: { $regex: req.body.name, $options: "i" } },
      ],
      libraries: { $in: req.body.libraries },
    })
      // .populate("libraries plans.plan oldPlans.plan")
      .select("-password -otpCode -emailCode -passwordRecoveryToken")
      .then((librarians) => {
        res.status(200).json(librarians);
      });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};



// all -open---------------------------------------------------------
exports.getOpenAllLibrarians = async (req, res) => {
  try {

    const librarians = await Librarian.find({ deleted: false })
      .sort({ firstName: 1 })
      .select("-password -otpCode -emailCode -passwordRecoveryToken");


    if (librarians.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No librarians found",
        error: {
          code: "NO_LIBRARIANS_FOUND",
          details: "There are currently no librarians available in the database.",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: librarians
    });
  } catch (err) {
    console.error("Error retrieving librarians:", err);
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