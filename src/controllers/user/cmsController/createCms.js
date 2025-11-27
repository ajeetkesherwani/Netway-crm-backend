const Cms = require("../../../models/cms");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");  

exports.createCms = catchAsync(async (req, res, next) => {
    const { aboutUs, terms_Conditions, privacyPolicy } = req.body;
    if (!aboutUs || !terms_Conditions || !privacyPolicy) {
        return next(new AppError("All fields are required", 400));
    }   

    const newCms = await Cms.create({ aboutUs, terms_Conditions, privacyPolicy });

    return successResponse(res, "CMS content created successfully", newCms);
}
);
