const ResellerConfig = require("../../../models/resellerConfig");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getResellerConfigList = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, type } = req.query;

    const filter = {};
    if (type) filter.type = type;

    const skip = (page - 1) * limit;


    // Fetch data normally
    const [rawData, total] = await Promise.all([
        ResellerConfig.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean(),
        ResellerConfig.countDocuments(filter)
    ]);

    // const [data, total] = await Promise.all([
    //     ResellerConfig.find(filter)
    //         // .populate("typeId", "resellerName email phoneNo") // Adjust fields as needed
    //         // .populate({
    //         //     path: "createdById",
    //         //     select: "resellerName email",
    //         //     model: (doc) => doc.createdBy || "Retailer" // fallback if needed
    //         // })
    //         .skip(skip)
    //         .limit(parseInt(limit))
    //         .sort({ createdAt: -1 }),
    //     ResellerConfig.countDocuments(filter)
    // ]);

    // Populate typeId name/email/phone dynamically
    const data = await Promise.all(
        rawData.map(async (doc) => {
            let typeData = null;
            if (doc.type === "Reseller") {
                typeData = await Reseller.findById(doc.typeId)
                    .select("resellerName")
                    .lean();
            } else if (doc.type === "Lco") {
                typeData = await Lco.findById(doc.typeId)
                    .select("lcoName")
                    .lean();
            }

            return {
                ...doc,
                typeId: typeData // overwrite typeId with populated data
            };
        })
    );


    successResponse(res, "ResellerConfig list fetched successfully", {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        data
    });
});
