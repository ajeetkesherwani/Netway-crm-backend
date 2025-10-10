const ResellerConfig = require("../../../models/resellerConfig");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerConfigList = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, type } = req.query;

    const filter = {};
    if (type) filter.type = type;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        ResellerConfig.find(filter)
            // .populate("typeId", "resellerName email phoneNo") // Adjust fields as needed
            // .populate({
            //     path: "createdById",
            //     select: "resellerName email",
            //     model: (doc) => doc.createdBy || "Retailer" // fallback if needed
            // })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 }),
        ResellerConfig.countDocuments(filter)
    ]);


    successResponse(res, "ResellerConfig list fetched successfully", {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        data
    });
});
