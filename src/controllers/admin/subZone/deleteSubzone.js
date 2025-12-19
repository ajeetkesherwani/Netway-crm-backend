const SubZone = require("../../../models/subZone");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteSubzone = catchAsync(async (req, res, next) => {
  const { subzoneId } = req.params;
  if (!subzoneId) return next(new AppError("subzoneId is required", 400));

  const subzone = await SubZone.findByIdAndDelete(subzoneId);
  if (!subzone) return next(new AppError("subzone not found", 404));

  successResponse(res, "subzone deleted successfully", subzone);
});
