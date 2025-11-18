
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
//     document
//   } = req.body;

//   // Basic validation
//   if (!generalInformation?.name || !generalInformation?.username || !generalInformation?.state) {
//     return next(new AppError("Required fields: name, username, state", 400));
//   }

//   // Ensure username is not null or empty
//   if (!generalInformation.username.trim()) {
//     return next(new AppError("Username cannot be empty", 400));
//   }

//   const existing = await User.findOne({ "generalInformation.username": generalInformation.username });
//   if (existing) {
//     return next(new AppError("Username already exists", 409));
//   }

//   // Hash password if provided
//   if (generalInformation.password) {
//     generalInformation.plainPassword = generalInformation.password
//     generalInformation.password = await bcrypt.hash(generalInformation.password, 10);
//   }

//   // Add createdBy information from logged-in user
//   generalInformation.createdBy = {
//     id: req.user._id,
//     type: req.user.role
//   };

//   // Ensure createdFor is provided in generalInformation
//   if (!generalInformation.createdFor || !generalInformation.createdFor.id || !generalInformation.createdFor.type) {
//     return next(new AppError("generalInformation.createdFor.id and generalInformation.createdFor.type are required", 400));
//   }

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
const AppError = require("../../../utils/AppError");
const bcrypt = require("bcryptjs");

exports.createUser = async (req) => {
  let { generalInformation, networkInformation, additionalInformation, documents } = req.body;

  // Parse JSON if sent as string
  if (typeof documents === "string") {
    documents = JSON.parse(documents);
  }

  // Validate required fields
  if (!generalInformation?.name || !generalInformation?.username || !generalInformation?.state) {
    throw new AppError("Required fields: name, username, state", 400);
  }

  // Validate username
  generalInformation.username = generalInformation.username.trim();
  if (!generalInformation.username) {
    throw new AppError("Username cannot be empty", 400);
  }

  // Unique username
  const exists = await User.findOne({
    "generalInformation.username": generalInformation.username
  });
  if (exists) {
    throw new AppError("Username already exists", 409);
  }

  // Password hashing
  if (generalInformation.password) {
    generalInformation.plainPassword = generalInformation.password;
    generalInformation.password = await bcrypt.hash(generalInformation.password, 10);
  }

  // Attach createdBy from authenticated user
  generalInformation.createdBy = {
    id: req.user._id,
    type: req.user.role
  };

  // Validate createdFor
  if (!generalInformation.createdFor?.id || !generalInformation.createdFor?.type) {
    throw new AppError("createdFor.id and createdFor.type are required", 400);
  }

  // Handle documents
  const uploadedFiles = req.files?.documents || [];
  const finalDocuments = [];

  if (Array.isArray(documents)) {
    documents.forEach((doc, i) => {
      const file = uploadedFiles[i];
      finalDocuments.push({
        documentType: doc.type,
        documentImage: file?.filename || null
      });
    });
  }

  // Create user
  const newUser = await User.create({
    generalInformation,
    networkInformation,
    additionalInformation,
    document: finalDocuments
  });

  return newUser;
};
