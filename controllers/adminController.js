// controllers\adminController.js
const Admin = require("../models/adminModel");
const bcrypt = require("bcryptjs");

const randomCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

exports.storeAdmin = async (req, res) => { //storing an admin
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    if (password.length >= 8) {
      bcrypt.hash(password, 12).then((hashedPassword) => {
        let payload = {
          ...req.body,
          email,
          passwordRecoveryToken: randomCode(),
          password: hashedPassword,
        };
        Admin.create(payload)
          .then(() => {
            return res.status(200).json({
              message: "Admin Registered Successfully",
            });
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).json({
              message: "Error Registering Admin",
              err,
            });
          });
      });
    } else {
      return res.status(400).json({
        message: "Password must be greater than or equal to 8 characters",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getAllAdmins = async (req, res) => { // retrieving all data
  try {
    const admins = await Admin.find().sort({ name: 1 });

    if (admins.length === 0) {
      return res.status(400).json({
        message: "No admins found"
      });
    }
    return res.status(200).json(admins);
  } catch (err) {
    console.error("Error retrieving admins:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString()
    });
  }
};


exports.showAdmin = async (req, res) => { // retrieving single admin
  try {
    const adminId = req.params.id;
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }
    return res.status(200).json(admin);
  } catch (err) {
    console.error("Error retrieving admin:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString()
    });
  }
};


exports.deleteAdmin = async (req, res) => { // deleting admin
  try {
    const adminId = req.params.id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }
    admin.is_active = false;
    await admin.save();
    return res.status(200).json({
      message: "Admin deleted"
    });
  } catch (err) {
    console.error("Error retrieving admin:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString()
    });
  }
};

exports.updateAdmin = async (req, res) => { // updating admin
  try {
    const adminId = req.params.id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    // Update admin with the request body
    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, req.body, { new: true });

    return res.status(200).json({
      message: "Admin updated successfully",
      admin: updatedAdmin
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.toString()
    });
  }
};
