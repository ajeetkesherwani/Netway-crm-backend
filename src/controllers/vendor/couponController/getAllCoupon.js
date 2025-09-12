const Coupon = require("../../../models/coupon");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllCoupons = catchAsync(async (req, res, next) => {

    const vendorId = req.vendor._id;

    const coupons = await Coupon.find({vendorId}).sort({ createdAt: -1 });

    res.status(200).json({
        status: true,
        message: "Coupons fetched successfully.",
        data: coupons
    });
});