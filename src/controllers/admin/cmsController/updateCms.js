const mongoose = require("mongoose");
const Cms = require("../../../models/cms");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

const cmsFields = ["aboutUs", "terms_Conditions", "privacyPolicy"];

exports.updateCms = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const body = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid CMS id", 400));
  }

  const updates = Object.fromEntries(
    cmsFields
      .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
      .map((field) => [field, body[field]])
  );

  if (Object.keys(updates).length === 0) {
    return next(new AppError("At least one CMS field is required", 400));
  }

  if (Object.values(updates).some((value) => typeof value !== "string")) {
    return next(new AppError("CMS fields must be strings", 400));
  }

  const cms = await Cms.findByIdAndUpdate(id, { $set: updates }, {
    new: true,
    runValidators: true,
  });

  if (!cms) {
    return next(new AppError("CMS not found", 404));
  }

  return successResponse(res, "CMS content updated successfully", cms);
});
