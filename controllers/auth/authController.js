// controllers\auth\authController.js
const User = require("../../models/userModel");
const Admin = require("../../models/adminModel");
const Librarian = require("../../models/librarianModel");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const handleErrorResponse = (res, err) => {
  if (err.statusCode) {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// login ***********************************************************************
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  
  let loadedUser;

  User.findOne({ email: email.toLowerCase() })
    .populate("libraries")
    .select("-otpCode -emailCode -passwordRecoveryToken -password")
    .then((user) => {
      if (!user) {
        const error = new Error("No user found by this email");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Invalid Password");
        error.statusCode = 400;
        throw error;
      }

      const token = generateToken({ userId: loadedUser._id });

      res.status(200).json({
        message: "Logged In Successfully",
        token,
        user: loadedUser._id,
      });
    })
    .catch((err) => {
      console.error(err);
      handleErrorResponse(res, err);
    });
};

exports.loginLibrarian = async (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  let userType = "";

  Librarian.findOne({ email: email.toLowerCase() })
    .populate("libraries")
    .select("-otpCode -emailCode -passwordRecoveryToken -password")
    .then(async (user) => {
      if (!user) {
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
          const error = new Error("No user found by this email");
          error.statusCode = 401;
          throw error;
        }
        loadedUser = admin;
        userType = "admin";
        return bcrypt.compare(password, admin.password);
      }
      loadedUser = user;
      userType = "librarian";
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Invalid Password");
        error.statusCode = 400;
        throw error;
      }

      const token = generateToken({ userId: loadedUser._id, type: userType });

      res.status(200).json({
        message: "Logged In Successfully",
        token,
        user: loadedUser._id,
        userType,
      });
    })
    .catch((err) => {
      console.error(err);
      handleErrorResponse(res, err);
    });
};

// verify ***********************************************************************
exports.verifyOtpUser = async (req, res, next) => {
  try {
    User.findById(req.body.user)
      .then(async (user) => {
        if (user.otpCode === req.body.code) {
          user.otpVerified = true;
          await user.save();
          return res.status(200).json({
            message: "OTP Verified",
          });
        } else {
          return res.status(400).json({
            message: "Wrong OTP Code Entered",
          });
        }
      })
      .catch((err) => {
        res.status(400).json({
          message: err,
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
exports.verifyEmailUser = async (req, res, next) => {
  try {
    User.findById(req.body.user)
      .then(async (user) => {
        if (user.emailCode === req.body.code) {
          user.emailVerified = true;
          await user.save();
          return res.status(200).json({
            message: "Email Verified",
          });
        } else {
          return res.status(400).json({
            message: "Wrong Code Entered",
          });
        }
      })
      .catch((err) => {
        res.status(400).json({
          message: err,
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.verifyOtpLibrarian = async (req, res, next) => {
  try {
    Librarian.findById(req.body.user)
      .then(async (user) => {
        if (user.otpCode === req.body.code) {
          user.otpVerified = true;
          await user.save();
          return res.status(200).json({
            message: "OTP Verified",
          });
        } else {
          return res.status(400).json({
            message: "Wrong OTP Code Entered",
          });
        }
      })
      .catch((err) => {
        res.status(400).json({
          message: err,
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
exports.verifyEmailLibrarian = async (req, res, next) => {
  try {
    Librarian.findById(req.body.user)
      .then(async (user) => {
        if (user.emailCode === req.body.code) {
          user.emailVerified = true;
          await user.save();
          return res.status(200).json({
            message: "Email Verified",
          });
        } else {
          return res.status(400).json({
            message: "Wrong Code Entered",
          });
        }
      })
      .catch((err) => {
        res.status(400).json({
          message: err,
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// update password ***********************************************************************
exports.updatePasswordUser = async (req, res, next) => {
  try {
    const { newPass, ConfirmPass, user, oldPass } = req.body;
    if (newPass !== ConfirmPass) {
      return res.status(400).json({
        message: "New & Confirm Password Doesn't Match",
      });
    }
    const doc = await User.findById(user);
    if (!doc) {
      return res.status(404).json({ message: "User not found" });
    }
    const validate = await bcrypt.compare(oldPass, doc.password);
    if (!validate) {
      return res.status(400).json({ message: "Old Password is Incorrect" });
    }
    const hashedPassword = await bcrypt.hash(newPass, 12);
    doc.password = hashedPassword;
    await doc.save();
    return res.status(200).json({
      message: "Password Updated!",
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.updatePasswordLibrarian = async (req, res, next) => {
  try {
    const { newPass, ConfirmPass, user, oldPass } = req.body;
    if (newPass !== ConfirmPass) {
      return res.status(400).json({
        message: "New & Confirm Password Doesn't Match",
      });
    }
    const doc = await Librarian.findById(user);
    if (!doc) {
      return res.status(404).json({ message: "User not found" });
    }
    const validate = await bcrypt.compare(oldPass, doc.password);
    if (!validate) {
      return res.status(400).json({ message: "Old Password is Incorrect" });
    }
    const hashedPassword = await bcrypt.hash(newPass, 12);
    doc.password = hashedPassword;
    await doc.save();
    return res.status(200).json({
      message: "Password Updated!",
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};
