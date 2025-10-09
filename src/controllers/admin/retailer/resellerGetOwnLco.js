const mongoose = require("mongoose");
const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerLcos = catchAsync(async (req, res, next) => {
    const { user } = req;
    let filter = {};

    console.log("User role:", user.role);
    console.log("User ID:", user._id);

    //  If logged in user is a Reseller → fetch only their LCOs
    if (user.role === "Reseller") {
        filter.retailerId = user._id;
    }

    //  If logged in user is Admin → can view LCOs of specific reseller
    else if (user.role === "Admin") {
        if (!req.query.resellerId) {
            return next(new AppError("Please provide resellerId in query", 400));
        }

        filter.retailerId = new mongoose.Types.ObjectId(req.query.resellerId);
    }

    //  Any other role not allowed
    else {
        return next(new AppError("Unauthorized to view LCOs", 403));
    }

    console.log("Filter used:", filter);

    const lcos = await Lco.find(filter)
        .populate("retailerId", "resellerName email")
        .lean();

    successResponse(res, "LCO list fetched successfully", lcos);
});
