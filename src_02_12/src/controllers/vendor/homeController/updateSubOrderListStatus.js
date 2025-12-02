const SubOrder = require("../../../models/SubOrder");
const Driver = require("../../../models/driver")
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateSubOrderListStatus = catchAsync(async (req, res, next) => {
    const { subOrderId } = req.params;
    const { status } = req.body;

    const subOrder = await SubOrder.findById(subOrderId);

    if (!subOrder) return next(new AppError("suborder not found", 404));

    subOrder.status = "accepted";

    if (status === "accepted") {
        const generateOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

        subOrder.pickupotp = generateOtp;
        subOrder.expiresAt = expiryTime;

        const deliveryBoy = await Driver.findById(subOrder.assignDeliveryBoyId);
       

        if (!deliveryBoy) {
            return next(new AppError("Assigned delivery boy not found", 404));
        }

        console.log(`Sending OTP ${generateOtp} to delivery boy at ${deliveryBoy.mobile}`);
    }

    await subOrder.save();

    res.status(200).json({
        status: true,
        message: "otp generate successfully",
        data: {
            otp: subOrder.pickupotp,
            driverId: subOrder.assignDeliveryBoyId
        },
    });
});