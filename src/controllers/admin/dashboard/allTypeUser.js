// const User = require("../../../models/user");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getUserByStatus = catchAsync(async (req, res, next) => {
//     const { _id, role } = req.user;

//     let match = {};

//     if (role === "Retailer") {
//         // Reseller can see only users created for them
//         match["generalInformation.createdFor.type"] = "Retailer";
//         match["generalInformation.createdFor.id"] = _id;
//     } else if (role === "Lco") {
//         // LCO can see only users created for them
//         match["generalInformation.createdFor.type"] = "Lco";
//         match["generalInformation.createdFor.id"] = _id;
//     }
//     // Admin: match remains {} => all users
//     const counts = await User.aggregate([
//         { $match: match },
//         { $match: { status: { $in: ["active", "Inactive", "Suspend", "Terminated"] } } }, // filter out null
//         {
//             $group: {
//                 _id: "$status",
//                 count: { $sum: 1 },
//             },
//         },
//     ]);

//     const result = { active: 0, Inactive: 0, Suspend: 0, Terminated: 0 };

//     counts.forEach((c) => {
//         result[c._id] = c.count;
//     });


//     successResponse(res, "all User found successfully basis on status", result);
// });


const User = require("../../../models/user");
const PurchasedPlan = require("../../../models/purchasedPlan");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUserByStatus = catchAsync(async (req, res, next) => {
    const { _id, role } = req.user;

    let match = {};

    if (role === "Retailer") {
        match["generalInformation.createdFor.type"] = "Retailer";
        match["generalInformation.createdFor.id"] = _id;
    } else if (role === "Lco") {
        match["generalInformation.createdFor.type"] = "Lco";
        match["generalInformation.createdFor.id"] = _id;
    }
    // Admin: sees all users

    // Step 1: Count users by status
    const counts = await User.aggregate([
        { $match: match },
        { $match: { status: { $in: ["active", "Inactive", "Suspend", "Terminated"] } } },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);

    const result = { active: 0, Inactive: 0, Suspend: 0, Terminated: 0 };

    counts.forEach((c) => {
        result[c._id] = c.count;
    });

    // Step 2: Count users without any plan
    const activationPending = await User.aggregate([
        { $match: match },
        {
            $lookup: {
                from: "purchasedplans",
                localField: "_id",
                foreignField: "userId",
                as: "plans",
            },
        },
        { $match: { plans: { $size: 0 } } }, // users with no plans
        { $count: "withoutPlan" },
    ]);

    result.activationPending = activationPending.length > 0 ? activationPending[0].withoutPlan : 0;

    successResponse(res, "User counts with users and without any plan user also", result);
});
