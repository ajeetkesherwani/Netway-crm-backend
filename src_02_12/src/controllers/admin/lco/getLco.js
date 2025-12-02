const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLcoList = catchAsync(async (req, res, next) => {
    const user = req.user;

    if (user.role !== "Admin" && user.role !== "Reseller") {
        return next(new AppError("You are not authorized to access this resource", 403));
    }

    // Query setup
    let query = {};
    if (user.role === "Reseller") {
        query = { retailerId: user._id }; // Reseller sees only their LCOs
    }
    // Admin sees all LCOs (query is empty)

    // Fetch LCOs and populate retailer name
    const lcoList = await Lco.find(query)
        .populate({
            path: "retailerId",
            select: "resellerName", // Retailer name
        });

    if (!lcoList || lcoList.length === 0) {
        return next(new AppError("LCO not found", 404));
    }

    // Add retailerName at top-level for each LCO
    const formattedList = lcoList.map(lco => ({
        ...lco.toObject(),
        retailerName: lco.retailerId?.name || "N/A"
    }));

    successResponse(res, "LCO found successfully", formattedList);
});
