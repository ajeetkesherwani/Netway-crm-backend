const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getStaff = catchAsync(async(req, res, next) => {

    const staff = await Staff.find().populate("role", "roleName");
    if(!staff) return next(new AppError("staff not found",404));

    successResponse(res, "staff found successfully", staff);
    
});