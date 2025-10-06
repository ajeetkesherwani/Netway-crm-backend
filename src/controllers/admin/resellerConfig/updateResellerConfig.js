const ResellerConfig = require("../../../models/resellerConfig");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateResellerConfig = catchAsync(async (req, res, next) => {
    const { id } = req.params; // ID of the ResellerConfig to update
    const user = req.user;
    console.log(id);
    const { type, typeId, admin, manager, operator } = req.body;

    // Find the existing config
    const existingConfig = await ResellerConfig.findById(id);
    if (!existingConfig) {
        return next(new AppError("ResellerConfig not found", 404));
    }

    // Optional: Validate type if it's being updated
    if (type) {
        const allowedTypes = ["Admin", "Manager", "Operator"];
        if (!allowedTypes.includes(type)) {
            return next(new AppError(`Invalid type. Allowed values are: ${allowedTypes.join(", ")}`, 400));
        }
        existingConfig.type = type;
    }

    // Update fields if provided
    if (typeId) existingConfig.typeId = typeId;
    if (admin) existingConfig.admin = admin;
    if (manager) existingConfig.manager = manager;
    if (operator) existingConfig.operator = operator;

    // Optionally update "createdBy" info if you want to track last updated user
    existingConfig.createdBy = user?.role || existingConfig.createdBy;
    existingConfig.createdById = user?._id || existingConfig.createdById;

    await existingConfig.save();

    successResponse(res, "ResellerConfig updated successfully", existingConfig);
});
