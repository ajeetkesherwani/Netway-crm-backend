const Coupon = require("../../../models/coupon");
const catchAsync = require("../../../utils/catchAsync");

exports.updateCoupon = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    console.log(req.body)


    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });

    if (!updatedCoupon) {
        return next(new AppError("Coupon not found.", 404));
    }

    res.status(200).json({
        status: true,
        message: "Coupon updated successfully.",
        data: updatedCoupon
    });
});
