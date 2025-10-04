const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getRetailer = catchAsync(async(req, res, next) => {

    const retailer = await Retailer.find()
    .populate({
        path: "role",
        select: "roleName"
    });
    if(!retailer) return next(new AppError("reatiler not found",404));

    successResponse(res, "retailer found successfully", retailer);

});