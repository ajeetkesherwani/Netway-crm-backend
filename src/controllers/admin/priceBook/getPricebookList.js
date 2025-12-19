// const PriceBook = require("../../../models/priceBook");
// const Reseller = require("../../../models/retailer");
// const Lco = require("../../../models/lco");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getPricebookList = catchAsync(async (req, res) => {
//     const priceBooks = await PriceBook.find().lean();

//     const data = await Promise.all(
//         priceBooks.map(async (pb) => {
//             const populatedAssignedTo = await Promise.all(
//                 pb.assignedTo.map(async (id) => {
//                     // Try Reseller
//                     const reseller = await Reseller.findById(id)
//                         .select("_id resellerName")
//                         .lean();

//                     if (reseller) return reseller;

//                     // Else LCO
//                     const lco = await Lco.findById(id)
//                         .select("_id lcoName")
//                         .lean();

//                     if (lco) return lco;

//                     return null;
//                 })
//             );

//             const filteredAssignedTo = populatedAssignedTo.filter(Boolean);

//             return {
//                 ...pb,
//                 assignedTo: filteredAssignedTo,
//                 assignedCount: filteredAssignedTo.length
//             };
//         })
//     );

//     successResponse(res, "pricebook list", data);
// });

const PriceBook = require("../../../models/priceBook");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPricebookList = catchAsync(async (req, res) => {
    const priceBooks = await PriceBook.find().lean();

    const data = await Promise.all(
        priceBooks.map(async (pb) => {
            // Populate assignedTo
            const populatedAssignedTo = await Promise.all(
                pb.assignedTo.map(async (id) => {
                    // Try Reseller
                    const reseller = await Reseller.findById(id)
                        .select("_id resellerName")
                        .lean();
                    if (reseller) return reseller;

                    // Else LCO
                    const lco = await Lco.findById(id)
                        .select("_id lcoName")
                        .lean();
                    if (lco) return lco;

                    return null;
                })
            );
            const filteredAssignedTo = populatedAssignedTo.filter(Boolean);

            //modifiedBy
            if (pb.modifiedById || pb.modifiedBy === "Admin") {
                if (pb.modifiedBy === "Reseller" && pb.modifiedById) {
                    const reseller = await Reseller.findById(pb.modifiedById)
                        .select("_id resellerName")
                        .lean();
                    if (reseller) pb.modifiedById = reseller;
                } else if (pb.modifiedBy === "Lco" && pb.modifiedById) {
                    const lco = await Lco.findById(pb.modifiedById)
                        .select("_id lcoName")
                        .lean();
                    if (lco) pb.modifiedById = lco;
                } else if (pb.modifiedBy === "Admin" && pb.modifiedById) {
                    pb.modifiedById = { _id: pb.modifiedById, name: "Admin" };
                }
            }

            return {
                ...pb,
                assignedTo: filteredAssignedTo,
                assignedCount: filteredAssignedTo.length
            };
        })
    );

    successResponse(res, "pricebook list", data);
});
