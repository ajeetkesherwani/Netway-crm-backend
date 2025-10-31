const Cms_Page = require("../../../models/cms_page");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getCmsPage = catchAsync(async(req, res, next) => {

    const cmsPage = await Cms_Page.find();
    if(!cmsPage) return next(new AppError("cms_page not found",404));

    successResponse(res, "cms_Page found", cmsPage);

});