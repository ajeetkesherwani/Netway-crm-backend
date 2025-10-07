// const User = require("../../../models/user");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const { successResponse } = require("../../../utils/responseHandler");
// const bcrypt = require("bcryptjs");

// exports.createUser = catchAsync(async (req, res, next) => {
//   const {
//     generalInformation,
//     networkInformation,
//     additionalInformation,
//     document,
//     createdForId,
//     createdForType
//   } = req.body;

//   // Basic validation
//   if (!generalInformation?.name || !generalInformation?.username || !generalInformation?.state) {
//     return next(new AppError("Required fields: name, username, state", 400));
//   }


//   const existing = await User.findOne({ "generalInformation.username": generalInformation.username });
//   if (existing) {
//     return next(new AppError("Username already exists", 409));
//   }

//   // Hash password if provided
//   if (generalInformation.password) {
//     generalInformation.password = await bcrypt.hash(generalInformation.password, 10);
//   }

//   // Add createdBy information
//   generalInformation.createdBy = {
//     id: req.user._id, // Logged-in user ID
//     type: req.user.role // "Admin", "Retailer", "Lco"
//   };

//   // Add createdFor information
//   generalInformation.createdFor = {
//     id: createdForId || req.user._id, // If not provided, set to self
//     type: createdForType || "Self"
//   };


//   // Create user
//   const newUser = await User.create({
//     generalInformation,
//     networkInformation,
//     additionalInformation,
//     document
//   });

//   successResponse(res, "User created successfully", newUser);
// });

const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const bcrypt = require("bcryptjs");

exports.createUser = catchAsync(async (req, res, next) => {
  const {
    generalInformation,
    networkInformation,
    additionalInformation,
    document
  } = req.body;

  // Basic validation
  if (!generalInformation?.name || !generalInformation?.username || !generalInformation?.state) {
    return next(new AppError("Required fields: name, username, state", 400));
  }

  // Ensure username is not null or empty
  if (!generalInformation.username.trim()) {
    return next(new AppError("Username cannot be empty", 400));
  }

  const existing = await User.findOne({ "generalInformation.username": generalInformation.username });
  if (existing) {
    return next(new AppError("Username already exists", 409));
  }

  // Hash password if provided
  if (generalInformation.password) {
    generalInformation.password = await bcrypt.hash(generalInformation.password, 10);
  }

  // Add createdBy information from logged-in user
  generalInformation.createdBy = {
    id: req.user._id,
    type: req.user.role
  };

  // Ensure createdFor is provided in generalInformation
  if (!generalInformation.createdFor || !generalInformation.createdFor.id || !generalInformation.createdFor.type) {
    return next(new AppError("generalInformation.createdFor.id and generalInformation.createdFor.type are required", 400));
  }

  // Create user
  const newUser = await User.create({
    generalInformation,
    networkInformation,
    additionalInformation,
    document
  });

  successResponse(res, "User created successfully", newUser);
});
