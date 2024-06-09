// controllers\librarianController.js
const Librarian = require("../models/librarianModel");
const bcrypt = require("bcryptjs");


const randomCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

exports.storeLibrarian = async (req, res) => {
  //storing an librarian
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    Librarian.findOne({ email }).then(async (librarian) => {
      if (librarian) {
        return res.status(400).json({
          message: "Librarian with same email already exists",
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
            Librarian.create(payload)
              .then(() => {
                return res.status(200).json({
                  message: "Librarian Registered Succesfully",
                });
              })
              .catch((err) => {
                console.log(err);
                return res.status(500).json({
                  message: "Error Registering Librarian",
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

exports.getAllLibrarians = async (req, res) => {
  // retrieving all data
  try {
    try {
      Librarian.find({is_active: true, firstName: 1})
        // .populate("libraries plans.plan oldPlans.plan")
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
  } catch (err) {
    console.error("Error retrieving librarians:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString(),
    });
  }
};

exports.getLibrariansByLibrary = async (req, res) => {
  try {
    Librarian.find({ libraries: { $in: req.body.libraries }, is_active: true, firstName: 1 })
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
  // retrieving single librarian
  try {
    const librarianId = req.params.id;
    const librarian = await Librarian.findOne({ _id: librarianId, is_active: true })
      // .populate("plans.plan oldPlans.plan libraries")
      //   .populate("plan libraries")
      .select("-password -otpCode -emailCode -passwordRecoveryToken");
    if (!librarian) {
      return res.status(404).json({
        message: "Librarian not found",
      });
    }
    return res.status(200).json(librarian);
  } catch (err) {
    console.error("Error retrieving librarian:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString(),
    });
  }
};

exports.deleteLibrarian = async (req, res) => {
  // deleting librarian
  try {
    const librarianId = req.params.id;
    const librarian = await Librarian.findById(librarianId);
    if (!librarian) {
      return res.status(404).json({
        message: "Librarian not found",
      });
    }
    librarian.is_active = false;
    await librarian.save();
    return res.status(200).json({
      message: "Librarian deleted",
    });
  } catch (err) {
    console.error("Error retrieving librarian:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.toString(),
    });
  }
};

exports.updateLibrarian = async (req, res) => {
  // updating librarian
  try {
    const librarianId = req.params.id;
    const librarian = await Librarian.findById(librarianId);

    if (!librarian) {
      return res.status(404).json({
        message: "Librarian not found",
      });
    }

    // Update librarian with the request body
    const updatedLibrarian = await Librarian.findByIdAndUpdate(librarianId, req.body, {
      new: true,
    });

    return res.status(200).json({
      message: "Librarian updated successfully",
      librarian: updatedLibrarian,
    });
  } catch (error) {
    console.error("Error updating librarian:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.toString(),
    });
  }
};

exports.changeStatus = (req, res, next) => {
  try {
    Librarian.findById(req.params.id)
      .then(async (librarian) => {
        librarian.blocked = !librarian.blocked;
        await librarian.save();
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