const mongoose = require("mongoose");
const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const catchAsync = require("../../../utils/catchAsync");

exports.userGlobalDetails = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("ID is required", 400));
  }

  const users = await User.findById(id)
    .populate("generalInformation.roleId", "roleName") 
    .populate("generalInformation.createdBy","name username")
    .populate("generalInformation.createdFor","name username")
    .populate("assignedHardware")
    .lean(); 

    const purchasedPlan = await PurchasedPlan.find({ userId: id })
    .populate("packageId", "packageName packageType") 
    // .populate("assignedBy", "name username");


  if (!users) {
    return successResponse(res, "No users found", []);
  }

  successResponse(res, "Users found successfully", {userBasicInformation: users, purchasedPlanData: purchasedPlan});
});
