const VendorWallet = require("../../../models_old/vendorWalletHistory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const paginate = require("../../../utils/paginate");
const { successResponse } = require("../../../utils/responseHandler");


exports.getAllVendorWalletList = catchAsync(async(req, res, next) => {

    const { reason, page, limit } = req.query;
    if(!reason) return next(new AppError("query is required", 400));

      const paginatedResult = await paginate(VendorWallet, { reason }, { page, limit });

    if (paginatedResult.paginateData.length === 0) {
        return successResponse(res, "No wallet history found for this reason", []);
    }

    successResponse(res, "Vendor Wallet History Found" , paginatedResult);

});