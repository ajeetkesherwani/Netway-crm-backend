const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLcoList = catchAsync(async(req, res, next) => {

    const lco = await Lco.find();

    if(!lco) return next(new AppError("Lco not found",404));

    successResponse(res, "lco found successfully", lco);

});
