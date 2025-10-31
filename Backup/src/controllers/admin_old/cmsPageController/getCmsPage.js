const Cms_Page = require("../../../models_old/cms_page");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllCmsPage = catchAsync(async (req, res, next) => {
  const { type } = req.params;

  const getAllCmsPage = await Cms_Page.find({ type: type });
  if (!getAllCmsPage) {
    return next(new AppError("Cms_page not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "cms_page found",
    count: getAllCmsPage.length,
    data: getAllCmsPage,
  });
});
