const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLcoList = catchAsync(async (req, res, next) => {
    const user = req.user;


    if (user.role !== "Admin" && user.role !== "Reseller") {
        return next(new AppError("You are not authorized to access this resource", 403));
    }

    let lco;

    if (user.role === "Reseller") {
        lco = await Lco.find({ retailerId: user._id });
    }
    if (user.role === "Admin") {
        lco = await Lco.find();
    }

    if (!lco || lco.length === 0) return next(new AppError("Lco not found", 404));

    successResponse(res, "lco found successfully", lco);

});
