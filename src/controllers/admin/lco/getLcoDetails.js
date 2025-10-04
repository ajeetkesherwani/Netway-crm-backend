const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getDetails = catchAsync(async(req, res, next) => {

    const { id } = req.params;
    if(!id) return next(new AppError("lco id is required",400));

    const lco = await Lco.findById(id).populate([
       { path:"roleId", select:"roleName" },
        { path:"retailerId", select:"resellerName" }
    ]);
    if(!lco) return next(new AppError("lco not found",404));

    successResponse(res, "Lco Details found successfully", lco);

});