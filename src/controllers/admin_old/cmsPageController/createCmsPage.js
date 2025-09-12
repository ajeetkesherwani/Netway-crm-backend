const Cms_Page = require("../../../models_old/cms_page");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createCmsPage = catchAsync(async (req, res, next) => {
  const { term_condition, privacy_policy, type, about_us } = req.body;
  if (!term_condition || !privacy_policy || !about_us) {
    return next(new AppError("All fields are required", 400));
  }
  const newCms_page = new Cms_Page({
    term_condition,
    privacy_policy,
    about_us,
    type,
  });
  await newCms_page.save();

  res
    .status(200)
    .json({
      status: true,
      message: "new Cms_page created successfully",
      data: newCms_page,
    });
});
