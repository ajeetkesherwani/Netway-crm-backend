const ResellerConfig = require("../../../models/resellerConfig");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateResellerConfig = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  const { type, typeId, admin, manager, operator } = req.body;

  // 1. Fetch the existing document
  const existingConfig = await ResellerConfig.findById(id);
  if (!existingConfig) {
    return next(new AppError("ResellerConfig not found", 404));
  }

  // 2. Validate type if provided
  if (type) {
    const allowedTypes = ["Admin", "Reseller", "Lco"];
    if (!allowedTypes.includes(type)) {
      return next(new AppError(`Invalid type. Allowed values are: ${allowedTypes.join(", ")}`, 400));
    }
    existingConfig.type = type;
  }

  // 3. Update typeId if provided
  if (typeId) {
    existingConfig.typeId = typeId;
  }

  // 4. Update permissions (replace or set new Map)
  if (admin) {
    existingConfig.admin = new Map(Object.entries(admin));
  }

  if (manager) {
    existingConfig.manager = new Map(Object.entries(manager));
  }

  if (operator) {
    existingConfig.operator = new Map(Object.entries(operator));
  }

  // 5. Update tracking info
  existingConfig.createdBy = user?.role || existingConfig.createdBy;
  existingConfig.createdById = user?._id || existingConfig.createdById;

  // 6. Save
  await existingConfig.save();

  successResponse(res, "ResellerConfig updated successfully", existingConfig);
});
