const Coupon = require("../../../models/coupon");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createCoupon = catchAsync(async (req, res, next) => {
    let { code, discountType, discountValue, minOrderAmount, parUserLimit, startDate, expiryDate } = req.body;

    // Validate required fields
    if (!code || !code.trim()) return next(new AppError("Coupon code is required.", 400));
    if (!discountType || !["percentage", "fixed"].includes(discountType)) return next(new AppError("Invalid discount type.", 400));
    if (!discountValue || discountValue <= 0) return next(new AppError("Discount value must be greater than 0.", 400));
    if (!startDate || !expiryDate) return next(new AppError("Start date and expiry date are required.", 400));

    const vendor_id = req.vendor._id;

    // Check if the coupon code already exists
    let existingCoupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existingCoupon) return next(new AppError("Coupon code already exists. Use a different code.", 400));

    // Create new coupon
    const coupon = new Coupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || 0,
        vendorId: vendor_id,
        parUserLimit: parUserLimit || 1,
        startDate,
        expiryDate,
        status: "active"
    });

    await coupon.save();

    return res.status(201).json({
        status: true,
        message: "Coupon created successfully.",
        data: { coupon }
    });
});
