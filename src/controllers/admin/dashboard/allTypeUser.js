const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUserByStatus = catchAsync(async (req, res, next) => {
    const { _id, role } = req.user;

    let match = {};

    if (role === "Retailer") {
        // Reseller can see only users created for them
        match["generalInformation.createdFor.type"] = "Retailer";
        match["generalInformation.createdFor.id"] = _id;
    } else if (role === "Lco") {
        // LCO can see only users created for them
        match["generalInformation.createdFor.type"] = "Lco";
        match["generalInformation.createdFor.id"] = _id;
    }
    // Admin: match remains {} => all users
    const counts = await User.aggregate([
        { $match: match },
        { $match: { status: { $in: ["active", "Inactive", "Suspend"] } } }, // filter out null
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);

    const result = { active: 0, Inactive: 0, Suspend: 0 };

    counts.forEach((c) => {
        result[c._id] = c.count;
    });


    successResponse(res, "all User found successfully basis on status", result);
});
