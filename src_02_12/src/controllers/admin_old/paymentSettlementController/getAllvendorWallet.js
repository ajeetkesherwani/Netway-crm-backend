const VendorWalletHistory = require("../../../models_old/vendorWalletHistory");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getVendorWalletList = (async(req, res, next) => {

    const getList = await VendorWalletHistory.find();

    if(!getList) return next(new AppError("Vendoer walletHistory not found", 404));

    successResponse(res, "vendor wallet found", getList);

});