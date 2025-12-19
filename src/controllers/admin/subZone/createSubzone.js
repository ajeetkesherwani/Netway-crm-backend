const SubZone = require("../../../models/subZone");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createSubzone = catchAsync(async (req, res, next) => {
  const { name, zoneId } = req.body;

  if (!name || name.trim() === "" || !zoneId)
    return next(new AppError("name and zoneId are required", 400));

  const subZone = new SubZone({
    name,
    zoneId,
  });

  await subZone.save();

  successResponse(res, "SubZone is created successfully", subZone);
});
