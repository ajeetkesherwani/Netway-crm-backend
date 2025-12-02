const SubOrder = require("../../../models/SubOrder");
const Driver = require("../../../models/driver");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.assignDeliveryBoyTosubOrder = catchAsync(async(req, res, next) => {

    const { subOrderId } = req. params;
    const { driverId } = req.body;

    const subOrder = await SubOrder.findById(subOrderId);
    if(!subOrder) return next(new AppError("subOrder not found", 404));

    const driver = await Driver.findById(driverId);
    if(!driver) return next(new AppError("driver not found", 404));

    subOrder.assignDeliveryBoyId = driverId;
    subOrder.isDeliveryAsign = true;

    await subOrder.save();

    successResponse(res, "Driver assign to suborder successfully", subOrder);

});