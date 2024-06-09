// controllers\userController.js
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const randomCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

exports.storeUser = async (req, res) => {
  //storing an user
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    User.findOne({ email }).then(async (user) => {
      if (user) {
        return res.status(400).json({
          message: "User with same email already exists",
        });
      } else {
        if (password.length >= 8) {
          bcrypt.hash(password, 12).then((hashedPassword) => {
            let payload = {
              ...req.body,
              email,
              password: hashedPassword,
              otpCode: randomCode(),
              emailCode: randomCode(),
              passwordRecoveryToken: randomCode(),
            };
            User.create(payload)
              .then(() => {
                return res.status(200).json({
                  message: "User Registered Succesfully",
                });
              })
              .catch((err) => {
                console.log(err);
                return res.status(500).json({
                  message: "Error Registering User",
                  err,
                });
              });
          });
        } else {
          return res.status(400).json({
            message: "Password must be greater than or equal to 8 characters",
          });
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getAllUsers = async (req, res) => {
  // retrieving all data
  try {
    try {
      User.find({firstName: 1})
        // .populate("libraries plans.plan oldPlans.plan")
        .select("-password -otpCode -emailCode -passwordRecoveryToken")
        //   .populate("plan libraries")
        .then((users) => {
          res.status(200).json(users);
        });
    } catch (err) {
      res.status(500).json({
        message: err.toString(),
      });
    }
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString(),
    });
  }
};

exports.getUsersByLibrary = async (req, res) => {
  try {
    User.find({ libraries: { $in: req.body.libraries }, firstName: 1 })
      .populate("libraries")
      .select("-password -otpCode -emailCode -passwordRecoveryToken")
      //   .populate("plan libraries")
      .then((users) => {
        res.status(200).json(users);
      });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.showUser = async (req, res) => {
  // retrieving single user
  try {
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId })
      // .populate("plans.plan oldPlans.plan libraries")
      //   .populate("plan libraries")
      .select("-password -otpCode -emailCode -passwordRecoveryToken");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error("Error retrieving user:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString(),
    });
  }
};

exports.deleteUser = async (req, res) => {
  // deleting user
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    user.is_active = false;
    await user.save();
    return res.status(200).json({
      message: "User deleted",
    });
  } catch (err) {
    console.error("Error retrieving user:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString(),
    });
  }
};

exports.updateUser = async (req, res) => {
  // updating user
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update user with the request body
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.toString(),
    });
  }
};

exports.changeStatus = (req, res, next) => {
  try {
    User.findById(req.params.id)
      .then(async (user) => {
        user.blocked = !user.blocked;
        await user.save();
        res.status(200).json({
          message: "Status Updated",
        });
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

// exports.updatePlan = (req, res, next) => {
//   try {
//     const { userId, plans } = req.body;

//     plans.map(async (obj) => {
//       User.findById(userId)
//         .populate("plans.plan")
//         .then(async (user) => {
//           if (user.plans.length > 0) {
//             const dbPlan = await Plan.findById(obj.plan);
//             const index = user.plans.findIndex((plan) =>
//               plan.plan.library.equals(dbPlan.library)
//             );
//             if (index === -1) {
//               user.plans = [...user.plans, obj];
//             } else {
//               let tempPlan = {
//                 plan: user.plans[index].plan._id,
//                 active: false,
//               };
//               user.oldPlans = [...user.oldPlans, tempPlan];
//               user.plans[index] = obj;
//             }
//             Sales.create(
//               {
//                 user: userId,
//                 plan: obj.plan,
//                 amount: dbPlan.price,
//               },
//               async (err, doc) => {
//                 await user.save();
//               }
//             );
//           } else {
//             user.plans = plans;
//             await user.save();
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

exports.searchUsers = async (req, res) => {
  try {
    // console.log(`req.body`, req.body);
    User.find({
      $or: [
        { firstName: { $regex: req.body.name, $options: "i" } },
        { lastName: { $regex: req.body.name, $options: "i" } },
      ],
      libraries: { $in: req.body.libraries },
    })
      // .populate("libraries plans.plan oldPlans.plan")
      .select("-password -otpCode -emailCode -passwordRecoveryToken")
      .then((users) => {
        res.status(200).json(users);
      });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};