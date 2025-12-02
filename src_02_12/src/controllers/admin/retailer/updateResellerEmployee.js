const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const bcrypt = require("bcryptjs");

exports.updateResellerEmployee = catchAsync(async (req, res, next) => {
    const { resellerId, employeeId } = req.params;
    const updateData = req.body;

    const retailer = await Retailer.findById(resellerId);
    if (!retailer) return next(new AppError("Retailer not found", 404));

    const employee = retailer.employeeAssociation.id(employeeId);
    if (!employee) return next(new AppError("Employee not found", 404));

    // Optional: Prevent overwriting array accidentally
    if ("employeeAssociation" in req.body) delete req.body.employeeAssociation;

    if (updateData.password) {
        employee.password = updateData.password;
        employee.markModified("password");
    }

    // Update employee fields dynamically
    Object.assign(employee, updateData);

    await retailer.save();

    return successResponse(res, "Employee updated successfully", employee);
});
