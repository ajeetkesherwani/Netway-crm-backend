const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUserDetails = (async (req, res, next) => {

  const { id } = req.params;
  if (!id) return next(new AppError("id is required", 400));

  const userDetails = await User.findById(id).populate([
    { path: "generalInformation.lcoId", select: "lcoName" },
    { path: "generalInformation.roleId", select: "roleName" },
    { path: "generalInformation.retailerId", select: "resellerName" }
  ]);
  if (!userDetails) return next(new AppError("user not found", 404));

  successResponse(res, "User details found successfully", userDetails);

});