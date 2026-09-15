const Lead = require("../../../models/lead");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLeadDetails = catchAsync(async (req, res, next) => {
  const { leadId } = req.params;
  if (!leadId) return next(new AppError("leadId is required", 400));

  let lead = await Lead.findById(leadId)
    .populate("zone", "name")
    .populate("area", "name");

  if (!lead) return next(new AppError("Lead not found", 404));

  // Dynamic populate for assignToId
  if (lead.assignToId && lead.assignToModel) {
    const selectMap = {
      Admin: "name email",
      Reseller: "resellerName email phoneNo",
      Lco: "lcoName email phoneNo",
      Staff: "name email phoneNo",
    };
    await lead.populate({
      path: "assignToId",
      select: selectMap[lead.assignToModel] || "name",
    });
  }

  // Dynamic populate for createdById
  if (lead.createdById && lead.createdByType) {
    const selectMap = {
      Admin: "name email",
      Reseller: "resellerName email phoneNo",
      Lco: "lcoName email phoneNo",
      Staff: "name email phoneNo",
    };
    await lead.populate({
      path: "createdById",
      model: lead.createdByType,
      select: selectMap[lead.createdByType] || "name",
    });
  }

  return successResponse(res, "Lead details fetched successfully", lead);
});
