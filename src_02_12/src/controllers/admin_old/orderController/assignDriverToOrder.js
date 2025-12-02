const MainOrder = require("../../../models_old/mainOrder");
const SubOrder = require("../../../models_old/SubOrder");
const Driver = require("../../../models_old/driver");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.assignDriverToOrder = (async (req, res, next) => {

    const { orderId, driverId } = req.body;
    if (!orderId || !driverId) return next(new AppError("driverId & driverId is required", 400));

    const order = await MainOrder.findById(orderId);
    if (!order) return next(new AppError("order not found", 404));

    const driver = await Driver.findById(driverId);
    if (!driver) return next(new AppError("driver not found", 404));

    if (driver.isBlocked) {
        return next(new AppError("driver is blocked, block driver can not be asign"));
    }

    order.assignDileveryBoyId = driver._id;
    order.isDriverAssign = true;
    await order.save();

    const subOrders = await SubOrder.find({ mainOrderId: orderId });
    for (let sub of subOrders) {
    if (!sub.isDeliveryAsign) {
      sub.assignDeliveryBoyId = driverId;
      sub.isDeliveryAsign = true;
      await sub.save();
    }
  }
  
    successResponse(res, "driver assign for order successfully", {
    mainOrderId: order._id,
    driverId: driverId,
    subOrdersAssigned: subOrders.map(s => s._id)

  });
});