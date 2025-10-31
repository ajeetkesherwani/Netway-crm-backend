const Cms_Page = require("../../../models/cms_page");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getList = catchAsync(async (req, res, next) => {
  const getList = await Cms_Page.find({ type: "User" });
  if (!getList) return next(new AppError("CMS data not found", 404));

  res.status(200).json({
    status: true,
    message: "Data found",
    data: getList,
  });
});
