const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUserDetails = (async (req, res, next) => {

  const { id } = req.params;
  if (!id) return next(new AppError("id is required", 400));

  const userDetails = await User.findById(id).populate([
    { path: "generalInformation.roleId", select: "roleName" },
    { path: "generalInformation.createdBy.id", select: "generalInformation.name generalInformation.username generalInformation.phone" },
    { path: "generalInformation.createdFor.id", select: "name resellerName lcoName email phone phoneNo" }
  ]);
  if (!userDetails) return next(new AppError("user not found", 404));

  const purchasePlanHistory = await PurchasedPlan.find({ userId: id })
    .populate([
      { path: "packageId", select: "packageName price duration" },
      { path: "purchasedById", select: "resellerName lcoName name" }
    ])
    .sort({ purchaseDate: -1, createdAt: -1 });

  successResponse(res, "User details found successfully", {
    user: userDetails,
    purchasePlans: purchasePlanHistory
  });

});