const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getRetailerDetails = catchAsync(async(req, res, next) => {

    const { id } = req.params;
    if(!id) return next(new AppError("retailer id is required",400));

    const reatiler = await Retailer.findById(id).populate({
        path: "role",
        select: "roleName"
    });
    if(!reatiler) return next(new AppError("reatailer not found",404));

    successResponse(res, "Retailer Details found successfully", reatiler);

});