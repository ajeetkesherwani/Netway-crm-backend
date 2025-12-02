const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");


exports.getLcoEmployeesList = catchAsync(async (req, res, next) => {
    const { lcoId } = req.params;
    console.log("lcoId", lcoId);

    const lco = await Lco.findById(lcoId);
    if (!lco) return next(new AppError("Lco not found", 404));

    return successResponse(res, "Employees fetched successfully", lco.employeeAssociation);
});