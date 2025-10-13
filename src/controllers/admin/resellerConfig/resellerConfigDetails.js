const ResellerConfig = require("../../../models/resellerConfig");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResllerConfigDetails = (async (req, res, next) => {

    const { configId } = req.params;
    if (!configId) return next(new AppError("cofingId is required", 400));

    const getConfigDetails = await ResellerConfig.findById(configId);
    if (!getConfigDetails) return next(new AppError("resllerConfig not found", 404));

    successResponse(res, "ResellerConfig Details found successfully", getConfigDetails);

});