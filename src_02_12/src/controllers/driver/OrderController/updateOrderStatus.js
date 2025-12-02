const SubOrder = require("../../../models/SubOrder");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateOrderStatus = catchAsync(async(req, res, next) => {

    const driverId = req.driver._id;
      const { subOrderId } = req.params;
      const { status } = req.body;

      if(!status) return next(new AppError("status is required", 400));

    const subOrder = await SubOrder.findById(subOrderId);
    if (!subOrder) return next(new AppError("SubOrder not found", 404));

    if (String(subOrder.assignDeliveryBoyId) !== String(driverId)) {
        return next(new AppError("Unauthorized access", 403));
    }

    subOrder.status = "pickuped";
    await subOrder.save();

    successResponse(res, "subOrder status updated successfully", {
        orderId: subOrder._id,
        status: subOrder.status
    });
});