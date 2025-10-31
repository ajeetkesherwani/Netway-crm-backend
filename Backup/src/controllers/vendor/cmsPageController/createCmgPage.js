const Cms_Page = require("../../../models/cms_page");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createCmgPage = catchAsync(async(req, res, next) => {

    
    const { term_condition, privacy_policy, about_us, type } = req.body;
    if(!term_condition) return next(new AppError("term_condition is required", 400));
    if(!privacy_policy) return next(new AppError("privacy_policy is required",400));
    if(!about_us) return next(new AppError("about_us is required", 400));

    const cmsPage = new Cms_Page({ term_condition, privacy_policy, about_us, type });

    await cmsPage.save();

    successResponse(res, "cms_page created successfully", cmsPage);

});