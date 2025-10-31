const ResellerConfig = require("../../../models/resellerConfig");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createResellerConfig = catchAsync(async (req, res, next) => {
    const user = req.user;
    const createdById = user?._id || null;
    const createdBy = user?.role || null;
    const { type, typeId, admin, manager, operator } = req.body;

    // Required validations
    if (!type) return next(new AppError("type is required", 400));
    if (!typeId) return next(new AppError("typeId is required", 400));

    // Check for valid type
    const allowedTypes = ["Reseller", "Lco"];
    if (!allowedTypes.includes(type)) {
        return next(new AppError(`Invalid type. Allowed values are: ${allowedTypes.join(", ")}`, 400));
    }

    const resellerConfig = new ResellerConfig({
        type,
        typeId,
        admin: admin || [],
        manager: manager || [],
        operator: operator || [],
        createdBy,
        createdById
    });

    await resellerConfig.save();

    successResponse(res, "ResellerConfig created successfully", resellerConfig);
});
