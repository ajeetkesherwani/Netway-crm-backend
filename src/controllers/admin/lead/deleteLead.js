const Lead = require("../../../models/lead");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteLead = catchAsync(async (req, res, next) => {
  const { leadId } = req.params;
  if (!leadId) return next(new AppError("leadId is required", 400));

  const lead = await Lead.findByIdAndDelete(leadId);
  if (!lead) return next(new AppError("Lead not found", 404));

  return successResponse(res, "Lead deleted successfully", lead);
});
