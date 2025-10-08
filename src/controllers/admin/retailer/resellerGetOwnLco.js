const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerLcos = catchAsync(async (req, res, next) => {
    console.log("User object:", req.user);
    console.log("User role:", req.user.role);

    const { user } = req;

    let filter = {};

    // ✅ Check role as a string directly
    if (user.role === "Reseller") {
        filter.resellerId = user._id; // Reseller → only own LCOs
    }
    else if (user.role === "Admin") {
        if (req.query.resellerId) filter.resellerId = req.query.resellerId; // Admin can filter
    }
    else {
        return next(new AppError("Unauthorized to view LCOs", 403));
    }

    const lcos = await Lco.find(filter)
        .populate("resellerId", "resellerName email")
        .lean();

    successResponse(res, "LCO list fetched successfully", lcos);
});
