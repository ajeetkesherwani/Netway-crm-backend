const Cms = require("../../../models/cms");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getCmsList = catchAsync(async (req, res, next) => {

    const cmsList = await Cms.find().sort({ createdAt: -1 }).lean(); 
     
    return successResponse(res, "CMS list fetched successfully", cmsList);
});

