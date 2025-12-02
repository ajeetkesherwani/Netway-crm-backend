const driverWalletHistory = require("../../../models_old/driverWalletHistory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const paginate = require("../../../utils/paginate");
const { successResponse } = require("../../../utils/responseHandler");


exports.getAllDriverWalletList = catchAsync(async(req, res, next) => {

    const { reason, page, limit } = req.query;
    if(!reason) return next(new AppError("query is required", 400));

    const paginatedResult = await paginate(driverWalletHistory, { reason }, { page, limit });


    if (paginatedResult.paginateData.length === 0) {
        return successResponse(res, "No wallet history found for this reason", []);
    }

    successResponse(res, "Driver Wallet History Found" , paginatedResult);

});