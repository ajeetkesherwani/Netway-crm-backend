const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLcosByResellerId = catchAsync(async (req, res, next) => {
    const { resellerId } = req.params;

    if (!resellerId) {
        return next(new AppError("Reseller ID is required", 400));
    }

    // Fetch LCOs and populate retailer name
    const lcoList = await Lco.find({ retailerId: resellerId })
        .populate({
            path: "retailerId",
            select: "resellerName", // Retailer name
        }).sort({ createdAt: -1 });

    if (!lcoList || lcoList.length === 0) {
        return next(new AppError("LCO not found for this reseller", 404));
    }

    // Add retailerName at top-level for each LCO
    const formattedList = lcoList.map(lco => ({
        ...lco.toObject(),
        retailerName: lco.retailerId?.resellerName || "N/A"
    }));

    successResponse(res, "LCO found successfully", formattedList);
});
