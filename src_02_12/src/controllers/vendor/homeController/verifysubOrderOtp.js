const SubOrder = require("../../../models/SubOrder");
const AppError = require("../../../utils/AppError");

exports.verifysubOrderOtp = (async (req, res, next) => {

    const { subOrderId } = req.params;
    const { otp } = req.body;

    const subOrder = await SubOrder.findById(subOrderId);
    if (!subOrder) return next(new AppError("subOrder not found", 404));

    if (!subOrder.expiresAt || subOrder.expiresAt < Date.now()) {
        return next(new AppError("otp is expired", 400));
    }

    if (subOrder.pickupotp !== otp) {
        return next(new AppError("invalid otp", 400));
    }

    subOrder.verified = true;
    subOrder.pickupotp = null;
    subOrder.expiresAt = null;

    await subOrder.save();

    res.status(200).json({
        status: true,
        message: "otp is verified successfully",
        data: {
            subOrderId: subOrder._id,
            verified: subOrder.verified
        }
    });
});