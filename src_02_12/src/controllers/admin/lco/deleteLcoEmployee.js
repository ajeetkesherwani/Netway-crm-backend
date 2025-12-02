const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteLcoEmployee = catchAsync(async (req, res, next) => {
    const { lcoId, employeeId } = req.params;

    const lco = await Lco.findById(lcoId);
    if (!lco) return next(new AppError("Lco not found", 404));

    // check if employee exists
    const existingEmployee = lco.employeeAssociation.find(
        (emp) => emp._id.toString() === employeeId
    );

    if (!existingEmployee) return next(new AppError("Employee not found", 404));

    // remove employee
    lco.employeeAssociation = lco.employeeAssociation.filter(
        (emp) => emp._id.toString() !== employeeId
    );

    await lco.save();

    return successResponse(res, "Employee deleted successfully", existingEmployee);
});
