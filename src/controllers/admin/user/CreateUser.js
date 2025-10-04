const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

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


  const existing = await User.findOne({ "generalInformation.username": generalInformation.username });
  if (existing) {
    return next(new AppError("Username already exists", 409));
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
