const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");


exports.getLcoEmployeeDetails = catchAsync(async (req, res, next) => {
    const { lcoId, employeeId } = req.params;

    const lco = await Lco.findById(lcoId);
    if (!lco) return next(new AppError("Lco not found", 404));

    const employee = lco.employeeAssociation.id(employeeId);
    if (!employee) return next(new AppError("Employee not found", 404));

    return successResponse(res, "Employee details fetched successfully", employee);
});
