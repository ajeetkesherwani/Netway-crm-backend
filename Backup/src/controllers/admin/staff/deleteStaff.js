const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteStaff = catchAsync(async(req, res, next) => {

    const { id } = req.params;
    if(!id) return next(new AppError("id is requierd",400));

    const staff =  await Staff.findByIdAndDelete(id);
    if(!staff) return next(new AppError("staff not found",404));

    successResponse(res, "staff deleted successfully", staff);

});