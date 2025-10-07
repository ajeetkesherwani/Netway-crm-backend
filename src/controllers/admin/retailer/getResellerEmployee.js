const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");


exports.getResellerEmployees = catchAsync(async (req, res, next) => {
    const { resllerId } = req.params;

    const retailer = await Retailer.findById(resllerId);
    if (!retailer) return next(new AppError("Retailer not found", 404));

    return successResponse(res, "Employees fetched successfully", retailer.employeeAssociation);
});