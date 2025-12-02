const Package = require("../../../models/package");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPackages = catchAsync(async(req, res, next) => {

    const packages = await Package.find();
    if(!packages) return next(new AppError("packages not found",404));

    successResponse(res, "Packages foundsuccessfully", packages);

});