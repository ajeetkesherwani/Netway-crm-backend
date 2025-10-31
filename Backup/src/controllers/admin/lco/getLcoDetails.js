const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getDetails = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { id } = req.params;
    if (!id) return next(new AppError("lco id is required", 400));

    let lco;

    if (user.role === "Reseller") {
        lco = await Lco.findOne({ _id: id, retailerId: user._id }).populate([
            { path: "role", select: "roleName" },
            { path: "retailerId", select: "resellerName" }
        ]);
    }
    if (user.role === "Admin") {
        lco = await Lco.findById(id).populate([
            { path: "role", select: "roleName" },
            { path: "retailerId", select: "resellerName" }
        ]);
    }
    if (!lco) return next(new AppError("lco not found", 404));

    successResponse(res, "Lco Details found successfully", lco);

});