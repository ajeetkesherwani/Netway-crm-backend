const LeadStage = require("../../../models/leadStage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

const validateStage = (leadName, sortOrder) => {
  const normalizedName = typeof leadName === "string" ? leadName.trim() : "";
  const normalizedSortOrder = Number(sortOrder);

  if (!normalizedName) {
    return { error: "Lead stage name is required" };
  }
  if (
    sortOrder === undefined ||
    sortOrder === null ||
    sortOrder === "" ||
    !Number.isInteger(normalizedSortOrder) ||
    normalizedSortOrder < 0
  ) {
    return { error: "Sort order must be a non-negative whole number" };
  }

  return { leadName: normalizedName, sortOrder: normalizedSortOrder };
};

exports.createLeadStage = catchAsync(async (req, res, next) => {
  const validated = validateStage(req.body.leadName, req.body.sortOrder);
  if (validated.error) {
    return next(new AppError(validated.error, 400));
  }

  const existingStage = await LeadStage.findOne({
    leadName: validated.leadName,
  });
  if (existingStage) {
    return next(new AppError("Lead stage name already exists", 409));
  }

  const leadStage = await LeadStage.create(validated);
  return successResponse(res, "Lead stage created successfully", leadStage, 201);
});

exports.getLeadStages = catchAsync(async (req, res) => {
  const leadStages = await LeadStage.find().sort({ sortOrder: 1, createdAt: 1 });
  return successResponse(res, "Lead stages fetched successfully", leadStages);
});

exports.getLeadStage = catchAsync(async (req, res, next) => {
  const leadStage = await LeadStage.findById(req.params.id);
  if (!leadStage) {
    return next(new AppError("Lead stage not found", 404));
  }

  return successResponse(res, "Lead stage fetched successfully", leadStage);
});

exports.updateLeadStage = catchAsync(async (req, res, next) => {
  const leadStage = await LeadStage.findById(req.params.id);
  if (!leadStage) {
    return next(new AppError("Lead stage not found", 404));
  }

  const leadName =
    req.body.leadName === undefined ? leadStage.leadName : req.body.leadName;
  const sortOrder =
    req.body.sortOrder === undefined ? leadStage.sortOrder : req.body.sortOrder;
  const validated = validateStage(leadName, sortOrder);
  if (validated.error) {
    return next(new AppError(validated.error, 400));
  }

  const existingStage = await LeadStage.findOne({
    leadName: validated.leadName,
    _id: { $ne: leadStage._id },
  });
  if (existingStage) {
    return next(new AppError("Lead stage name already exists", 409));
  }

  leadStage.leadName = validated.leadName;
  leadStage.sortOrder = validated.sortOrder;
  await leadStage.save();

  return successResponse(res, "Lead stage updated successfully", leadStage);
});

exports.deleteLeadStage = catchAsync(async (req, res, next) => {
  const leadStage = await LeadStage.findByIdAndDelete(req.params.id);
  if (!leadStage) {
    return next(new AppError("Lead stage not found", 404));
  }

  return successResponse(res, "Lead stage deleted successfully", leadStage);
});
