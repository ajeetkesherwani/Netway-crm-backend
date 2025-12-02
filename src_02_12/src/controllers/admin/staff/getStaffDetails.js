const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getStaffDetails = catchAsync(async (req, res, next) => {
    const { staffId } = req.params;

    if (!staffId) {
        return next(new AppError("Staff ID is required", 400));
    }

    const staff = await Staff.findById(staffId).populate("role", "roleName");
    console.log("staff", staff);
    if (!staff) {
        return next(new AppError("Staff not found", 404));
    }

    successResponse(res, "Staff details fetched successfully", staff);

});
