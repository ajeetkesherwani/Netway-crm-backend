
const PaymentModeSection = require('../../../models/paymentmode');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/AppError');
const { successResponse } = require('../../../utils/responseHandler');

// CREATE PAYMENT MODE SECTION
exports.createPaymentModeSection = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return next(new AppError("Payment mode section name is required", 400));
    }

    const existingSection = await PaymentModeSection.findOne({
        name: name.trim(),
    });

    if (existingSection) {
        return next(new AppError("Payment mode section already exists", 409));
    }

    const paymentModeSection = await PaymentModeSection.create({
        name: name.trim(),
        createdBy: req.user._id,
        createdByRole: req.user.role,
    });

    return successResponse(
        res,
        "Payment mode section created successfully",
        paymentModeSection
    );
});


// GET ALL PAYMENT MODE SECTIONS
exports.getPaymentModeSections = catchAsync(async (req, res, next) => {
    const paymentModeSections = await PaymentModeSection.find()
        .sort({ createdAt: -1 })
        .populate("createdBy", "name email")
        .lean();

    return successResponse(
        res,
        "Payment mode sections fetched successfully",
        paymentModeSections
    );
});


// GET PAYMENT MODE SECTION BY ID
exports.getPaymentModeSectionById = catchAsync(async (req, res, next) => {
    const paymentModeSection = await PaymentModeSection.findById(req.params.id)
        .populate("createdBy", "name email")
        .lean();

    if (!paymentModeSection) {
        return next(new AppError("Payment mode section not found", 404));
    }

    return successResponse(
        res,
        "Payment mode section fetched successfully",
        paymentModeSection
    );
});


// UPDATE PAYMENT MODE SECTION
exports.updatePaymentModeSection = catchAsync(async (req, res, next) => {
    const { name, status } = req.body;

    const paymentModeSection = await PaymentModeSection.findById(req.params.id);

    if (!paymentModeSection) {
        return next(new AppError("Payment mode section not found", 404));
    }

    if (name !== undefined) {
        if (!name.trim()) {
            return next(new AppError("Payment mode section name cannot be empty", 400));
        }

        const existingSection = await PaymentModeSection.findOne({
            name: name.trim(),
            _id: { $ne: req.params.id },
        });

        if (existingSection) {
            return next(new AppError("Payment mode section name already exists", 409));
        }

        paymentModeSection.name = name.trim();
    }

    if (status !== undefined) {
        paymentModeSection.status = status;
    }

    await paymentModeSection.save();

    return successResponse(
        res,
        "Payment mode section updated successfully",
        paymentModeSection
    );
});


// DELETE PAYMENT MODE SECTION
exports.deletePaymentModeSection = catchAsync(async (req, res, next) => {
    const paymentModeSection = await PaymentModeSection.findByIdAndDelete(
        req.params.id
    );

    if (!paymentModeSection) {
        return next(new AppError("Payment mode section not found", 404));
    }

    return successResponse(
        res,
        "Payment mode section deleted successfully",
        paymentModeSection
    );
});
