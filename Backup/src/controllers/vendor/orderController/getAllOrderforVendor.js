const SubOrder = require("../../../models/SubOrder");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAllSubOrder = catchAsync(async(req, res, next) => {

    const  vendorId  = req.vendor._id;
    console.log("vendorId", vendorId);
    if(!vendorId) return next(new AppError("vendorId is required",400));

    const allOrder = await SubOrder.find({ vendorId });

    successResponse(res, "all subOrder found for this vendor", allOrder);

});