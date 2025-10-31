const ResellerConfig = require("../../../models/resellerConfig");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteResellerConfig = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const resellerConfig = await ResellerConfig.findById(id);

    if (!resellerConfig) {
        return next(new AppError("ResellerConfig not found", 404));
    }

    await resellerConfig.deleteOne();

    successResponse(res, "ResellerConfig deleted successfully");
});
