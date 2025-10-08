const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const bcrypt = require("bcryptjs");

exports.updateLcoEmployee = catchAsync(async (req, res, next) => {
    const { lcoId, employeeId } = req.params;
    const updateData = req.body;

    const lco = await Lco.findById(lcoId);
    if (!lco) return next(new AppError("Lco not found", 404));

    const employee = lco.employeeAssociation.id(employeeId);
    if (!employee) return next(new AppError("Employee not found", 404));

    // Optional: Prevent overwriting array accidentally
    if ("employeeAssociation" in req.body) delete req.body.employeeAssociation;

    // Handle password update securely
    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Update employee fields dynamically
    Object.assign(employee, updateData);

    await lco.save();

    return successResponse(res, "Employee updated successfully", employee);
});
