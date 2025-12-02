const Zone = require("../../../models/zone");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createZone = catchAsync(async (req, res, next) => {
    const { zoneName } = req.body;

    if (!zoneName) return next(new AppError("zoneName is required", 400));

    // Dynamic createdBy and createdById
    const createdById = req.user?._id || null;
    const createdBy = req.user?.role || null;

    if (!createdById || !createdBy) {
        return next(new AppError("Unauthorized: no user found", 401));
    }

    const zone = new Zone({
        zoneName,
        createdBy,
        createdById
    });

    await zone.save();

    successResponse(res, "Zone is created successfully", zone);
});
