const Zone = require("../../../models/zone");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createZone = catchAsync(async (req, res, next) => {

    const { zoneName, addedBy } = req.body;
    if (!zoneName) return next(new AppError("zoneName is required", 400));
    if (!addedBy) return next(new AppError("addedBy is required", 400));

    const zone = new Zone({ zoneName, addedBy });

    await zone.save();

    successResponse(res, "zone is created successfully", zone);

});