const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");


exports.getResellerEmployeeDetails = catchAsync(async (req, res, next) => {
    const { resellerId, employeeId } = req.params;

    const retailer = await Retailer.findById(resellerId);
    if (!retailer) return next(new AppError("Retailer not found", 404));

    const employee = retailer.employeeAssociation.id(employeeId);
    if (!employee) return next(new AppError("Employee not found", 404));

    return successResponse(res, "Employee details fetched successfully", employee);
});
