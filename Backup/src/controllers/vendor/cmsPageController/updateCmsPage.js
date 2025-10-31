const Cms_Page = require("../../../models/cms_page");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateCmsPage = catchAsync(async(req, res, next) => {
    const { id } = req.params;
    if(!id) return next(new AppError("id is required", 400));

    const { term_condition, privacy_policy, type, about_us } = req.body;

    const updatedCmsPage = await Cms_Page.findById(id);
    if(!updatedCmsPage){
        return next(new AppError("cms_page not found", 404));
    }

    updatedCmsPage.term_condition = term_condition || updatedCmsPage.term_condition
    updatedCmsPage.privacy_policy = privacy_policy ||updatedCmsPage.privacy_policy
    updatedCmsPage.type = type || updatedCmsPage.type
    updatedCmsPage.about_us = about_us || updatedCmsPage.about_us

    await updatedCmsPage.save();

 successResponse(res, "cmsPage updated successfully", updatedCmsPage);

});