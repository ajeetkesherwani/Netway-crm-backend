const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteResellerEmployee = catchAsync(async (req, res, next) => {
    const { resellerId, employeeId } = req.params;

    const retailer = await Retailer.findById(resellerId);
    if (!retailer) return next(new AppError("Retailer not found", 404));

    // check if employee exists
    const existingEmployee = retailer.employeeAssociation.find(
        (emp) => emp._id.toString() === employeeId
    );

    if (!existingEmployee) return next(new AppError("Employee not found", 404));

    // remove employee
    retailer.employeeAssociation = retailer.employeeAssociation.filter(
        (emp) => emp._id.toString() !== employeeId
    );

    await retailer.save();

    return successResponse(res, "Employee deleted successfully", existingEmployee);
});
