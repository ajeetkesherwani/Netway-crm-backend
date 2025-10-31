const Coupon = require("../../../models/coupon");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteCoupon = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
        return next(new AppError("Coupon not found.", 404));
    }

    res.status(200).json({
        status: true,
        message: "Coupon deleted successfully.",
        data: deletedCoupon
    });
});
