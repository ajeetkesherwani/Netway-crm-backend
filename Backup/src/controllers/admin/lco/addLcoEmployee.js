const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const bcrypt = require("bcryptjs");

exports.addLcoEmployee = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { employee } = req.body;

    if (!employee || typeof employee !== "object") {
        return next(new AppError("Employee object is required", 400));
    }

    const requiredFields = ["employeeUserName", "password"];
    for (let field of requiredFields) {
        if (!employee[field]) {
            return next(new AppError(`Field '${field}' is required in employee object`, 400));
        }
    }

    // Find retailer by ID
    const lco = await Lco.findById(id);
    if (!lco) return next(new AppError("Retailer not found", 404));

    // Check for duplicate employee username
    const existingEmp = lco.employeeAssociation.find(
        (emp) => emp.employeeUserName === employee.employeeUserName
    );
    if (existingEmp) return next(new AppError("Employee username already exists", 400));


    lco.employeeAssociation.push(employee);

    await lco.save();

    return successResponse(res, "Employee added successfully", lco.employeeAssociation);
});
