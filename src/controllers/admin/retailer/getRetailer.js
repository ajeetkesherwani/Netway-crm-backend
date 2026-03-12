const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getRetailer = catchAsync(async (req, res, next) => {

    const retailer = await Retailer.find()
        .select("role phoneNo email mobileNo resellerName walletBalance balance status createdAt updatedAt")
        .populate({
            path: "role",
            select: "roleName"
        }).sort({ createdAt: -1 });
    if (!retailer) return next(new AppError("reatiler not found", 404));
    console.log("retailer", retailer);
    successResponse(res, "retailer found successfully", retailer);
});