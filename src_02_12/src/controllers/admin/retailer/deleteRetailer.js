const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteRetailer = catchAsync(async(req, res, next) => {

    const { id } = req.params;
    console.log("id",id)
    if(!id) return next(new AppError("id is required",404));

    const retailer = await Retailer.findByIdAndDelete(id);
   
    if(!retailer) return next(new AppError("retailer not found",404));

    successResponse(res, "retailer deleted successfully", retailer);

});