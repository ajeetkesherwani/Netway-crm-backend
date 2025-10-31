const SubOrder = require("../../../models_old/SubOrder");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getOrderList = catchAsync(async(req, res, next) => {

    const { vendorId } = req.params;
    if(!vendorId) return next(new AppError("vendor id is required",400));

    const orderList = await SubOrder.find({ vendorId });
   
    successResponse(res, "All order List found for this vendor", orderList);

});