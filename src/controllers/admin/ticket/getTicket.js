// const Admin = require("../../../models/admin");
// const Ticket = require("../../../models/ticket");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getTicketList = catchAsync(async (req, res, next) => {
//     const { filter } = req.query;

//     // Initialize arrays
//     let openTickets = [];
//     let assignedTickets = [];
//     let nonAssignedTickets = [];
//     let fixedTickets = [];
//     let closedTickets = [];
//     let resolvedTickets = [];
//     let approvalTickets = [];
//     let allTickets = [];

//     // Fields to return
//     const selectFields =
//         "personName personNumber assignToModel category email address callSource status ticketNumber severity assignToId createdAt  fixedByType fixedBy fixedAt userId";

//     // Population
//     const populateAssignTo = [
//         {path: "assignToId", select: "staffName resellerName lcoName generalInformation.name name"},
//          {path: "fixedBy", select: "staffName resellerName lcoName generalInformation.name name"},
//         { path: "category", select: "name"  },
//         { path: "userId", select: "addressDetails.area",
//       populate: [
//        {path: "addressDetails.area", select: "areaName zoneName" },
//       { path: "generalInformation.createdFor.id", select: "lcoName resellerName name" }
// ]
//   }

//     ]

//     // If no filter — return all tickets
//     if (!filter) {
//         allTickets = await Ticket.find()
//             .select(selectFields)
//             .populate(populateAssignTo);

//         const totalCount = allTickets.length;

//         return successResponse(res, "All tickets fetched successfully", {
//             totalCount,
//             allTickets,
//         });
//     }

//     // Filter-based fetching
//     if (filter === "Manage") {
//         [openTickets, assignedTickets, approvalTickets] = await Promise.all([
//             Ticket.find({ status: "Open" }).select(selectFields).populate(populateAssignTo),
//             Ticket.find({ status: "Assigned" }).select(selectFields).populate(populateAssignTo),
//             Ticket.find({ status: "Approval" }).select(selectFields).populate(populateAssignTo),
//         ]);
//     } else if (filter === "Assigned") {
//         assignedTickets = await Ticket.find({ status: "Assigned" })
//             .select(selectFields)
//             .populate(populateAssignTo);
//     } else if (filter === "NonAssigned") {
//         nonAssignedTickets = await Ticket.find({ status: "NonAssigned" })
//             .select(selectFields)
//             .populate(populateAssignTo);
//     } else if (filter === "Fixed") {
//         fixedTickets = await Ticket.find({ status: "Fixed" })
//             .select(selectFields)
//             .populate("fixedBy")
//             .populate(populateAssignTo);
//             console.log("Fixed Tickets:", fixedTickets);
//     } else if (filter === "Closed") {
//         closedTickets = await Ticket.find({ status: "Closed" })
//             .select(selectFields)
//             .populate(populateAssignTo);
//     } else if (filter === "Open") {
//         openTickets = await Ticket.find({ status: "Open" })
//             .select(selectFields)
//             .populate(populateAssignTo);
//     } else if (filter === "Approval") {
//         approvalTickets = await Ticket.find({ status: "Approval" })
//             .select(selectFields)
//             .populate(populateAssignTo);
//     }
//     else if (filter === "Resolved") {
//         resolvedTickets = await Ticket.find({ status: "Resolved" })
//             .select(selectFields)
//             .populate(populateAssignTo);
//     } else {
//         return next(
//             new AppError(
//                 "Invalid filter value. Use 'Assigned', 'NonAssigned', 'Open', 'Closed', 'Fixed', 'Resolved', or 'Manage'",
//                 400
//             )
//         );
//     }

//     // ✅ Calculate counts
//     const counts = {
//         openCount: openTickets.length,
//         assignedCount: assignedTickets.length,
//         nonAssignedCount: nonAssignedTickets.length,
//         fixedCount: fixedTickets.length,
//         closedCount: closedTickets.length,
//         resolvedCount: resolvedTickets.length,
//         approvalCount: approvalTickets.length,
//     };

//     // ✅ Send response with counts
//     successResponse(res, "Ticket list fetched successfully", {
//         ...counts,
//         openTickets,
//         assignedTickets,
//         nonAssignedTickets,
//         fixedTickets,
//         closedTickets,
//         resolvedTickets,
//         approvalTickets,
//     });
// });

const { default: mongoose } = require("mongoose");
const Ticket = require("../../../models/ticket");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getTicketList = catchAsync(async (req, res) => {
  const {
    filter,
    page = 1,
    limit = 10,
    userSearch,
    ticketNumber,
    createdFrom,
    createdTo,
    fixedBy,
    category,
    assignTo,
    callSource,
    resellerId,
    lcoId,
    zoneId,
  } = req.query;

  // Build match conditions
  const match = {};

  // Status filter (for tabs like All, Closed, Assigned)
  if (filter && filter !== "Manage") {
    match.status = filter;
  }

  // Unified user search: matches name OR mobile OR email
  if (userSearch) {
    match.$or = [
      { personName: { $regex: userSearch, $options: "i" } },
      { personNumber: { $regex: userSearch, $options: "i" } },
      { email: { $regex: userSearch, $options: "i" } },
    ];
  }

  if (ticketNumber)
    match.ticketNumber = { $regex: ticketNumber, $options: "i" };
  if (callSource) match.callSource = callSource;

  // ✅ DATE FILTER (EXACT DAY OR RANGE)
  // Case 1: ONLY createdFrom → filter by createdAt (same day)
  if (createdFrom && !createdTo) {
    const start = new Date(createdFrom);
    start.setHours(0, 0, 0, 0);

    const end = new Date(createdFrom);
    end.setHours(23, 59, 59, 999);

    match.createdAt = { $gte: start, $lte: end };
  }

  // Case 2: ONLY createdTo → filter by updatedAt (same day)
  if (!createdFrom && createdTo) {
    const start = new Date(createdTo);
    start.setHours(0, 0, 0, 0);

    const end = new Date(createdTo);
    end.setHours(23, 59, 59, 999);

    match.updatedAt = { $gte: start, $lte: end };
  }
  if (assignTo) match.assignToId = { $regex: assignTo, $options: "i" };
  if (fixedBy) match.fixedBy = { $regex: fixedBy, $options: "i" };
  if (resellerId) match.resellerId = new mongoose.Types.ObjectId(resellerId);
  if (lcoId) match.lcoId = new mongoose.Types.ObjectId(lcoId);
  if (zoneId) {
    match.zoneId = new mongoose.Types.ObjectId(zoneId);
  }
  if (category) {
    match.category = new mongoose.Types.ObjectId(category);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "ticketcategories",
        localField: "category",
        foreignField: "_id",
        as: "ticketCategory",
      },
    },
    {
      $unwind: { path: "$ticketCategory", preserveNullAndEmptyArrays: false },
    },
    // {
    //   $lookup: {
    //     from: "TicketResolution",
    //     localField: "resolution",
    //     foreignField: "_id",
    //     as: "ticketResolution",
    //   },
    // },
    // {
    //   $unwind: { path: "$ticketResolution", preserveNullAndEmptyArrays: false },
    // },
    {
      $addFields: {
        category: "$ticketCategory.name",
        resolution: "$ticketResolution.name",
      },
    },
    {
      $project: {
        ticketNumber: 1,
        personName: 1,
        personNumber: 1,
        email: 1,
        address: 1,
        callSource: 1,
        severity: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        assignToModel: 1,
        fixedByType: 1,
        fixedAt: 1,
        category: 1,
        resolution: 1,
      },
    },

    { $skip: skip },
    { $limit: parseInt(limit) },
  ];

  // const pipeline = [
  //   { $match: match },

  //   // Lookups (keep exactly as you had before)
  //   {
  //     $lookup: {
  //       from: "ticketcategories",
  //       localField: "category",
  //       foreignField: "_id",
  //       as: "category",
  //     },
  //   },
  //   { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
  //   {
  //     $lookup: {
  //       from: "staffs",
  //       localField: "assignToId",
  //       foreignField: "_id",
  //       as: "assignStaff",
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "admins",
  //       localField: "assignToId",
  //       foreignField: "_id",
  //       as: "assignAdmin",
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "retailers",
  //       localField: "assignToId",
  //       foreignField: "_id",
  //       as: "assignRetailer",
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "lcos",
  //       localField: "assignToId",
  //       foreignField: "_id",
  //       as: "assignLco",
  //     },
  //   },

  //   {
  //     $lookup: {
  //       from: "admins",
  //       localField: "fixedBy",
  //       foreignField: "_id",
  //       as: "fixedAdmin",
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "retailers",
  //       localField: "fixedBy",
  //       foreignField: "_id",
  //       as: "fixedRetailer",
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "lcos",
  //       localField: "fixedBy",
  //       foreignField: "_id",
  //       as: "fixedLco",
  //     },
  //   },

  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "userId",
  //       foreignField: "_id",
  //       as: "user",
  //     },
  //   },
  //   { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },

  //   {
  //     $lookup: {
  //       from: "zones",
  //       localField: "user.addressDetails.area",
  //       foreignField: "_id",
  //       as: "area",
  //     },
  //   },
  //   { $unwind: { path: "$area", preserveNullAndEmptyArrays: true } },

  //   {
  //     $lookup: {
  //       from: "retailers",
  //       localField: "user.generalInformation.createdFor.id",
  //       foreignField: "_id",
  //       as: "createdRetailer",
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "lcos",
  //       localField: "user.generalInformation.createdFor.id",
  //       foreignField: "_id",
  //       as: "createdLco",
  //     },
  //   },

  //   {
  //     $addFields: {
  //       createdFor: {
  //         type: "$user.generalInformation.createdFor.type",
  //         id: {
  //           $cond: [
  //             { $eq: ["$user.generalInformation.createdFor.type", "Retailer"] },
  //             { $arrayElemAt: ["$createdRetailer.resellerName", 0] },
  //             {
  //               $cond: [
  //                 { $eq: ["$user.generalInformation.createdFor.type", "Lco"] },
  //                 { $arrayElemAt: ["$createdLco.lcoName", 0] },
  //                 "$user.generalInformation.createdFor.id",
  //               ],
  //             },
  //           ],
  //         },
  //       },
  //     },
  //   },

  //   {
  //     $project: {
  //       ticketNumber: 1,
  //       personName: 1,
  //       personNumber: 1,
  //       email: 1,
  //       address: 1,
  //       callSource: 1,
  //       severity: 1,
  //       status: 1,
  //       createdAt: 1,
  //       updatedAt: 1,
  //       assignToModel: 1,
  //       fixedByType: 1,
  //       fixedAt: 1,

  //       category: { _id: "$category._id", name: "$category.name" },

  //       assignToId: {
  //         $cond: [
  //           { $eq: ["$assignToModel", "Staff"] },
  //           { $arrayElemAt: ["$assignStaff.staffName", 0] },
  //           {
  //             $cond: [
  //               { $eq: ["$assignToModel", "Reseller"] },
  //               { $arrayElemAt: ["$assignRetailer.resellerName", 0] },
  //               {
  //                 $cond: [
  //                   { $eq: ["$assignToModel", "Lco"] },
  //                   { $arrayElemAt: ["$assignLco.lcoName", 0] },
  //                   { $arrayElemAt: ["$assignAdmin.name", 0] },
  //                 ],
  //               },
  //             ],
  //           },
  //         ],
  //       },

  //       fixedBy: {
  //         $cond: [
  //           {
  //             $and: [
  //               { $ne: ["$fixedBy", null] },
  //               { $eq: ["$fixedByType", "Admin"] },
  //             ],
  //           },
  //           { $arrayElemAt: ["$fixedAdmin.name", 0] },
  //           {
  //             $cond: [
  //               {
  //                 $and: [
  //                   { $ne: ["$fixedBy", null] },
  //                   { $eq: ["$fixedByType", "Reseller"] },
  //                 ],
  //               },
  //               { $arrayElemAt: ["$fixedRetailer.resellerName", 0] },
  //               {
  //                 $cond: [
  //                   {
  //                     $and: [
  //                       { $ne: ["$fixedBy", null] },
  //                       { $eq: ["$fixedByType", "Lco"] },
  //                     ],
  //                   },
  //                   { $arrayElemAt: ["$fixedLco.lcoName", 0] },
  //                   null,
  //                 ],
  //               },
  //             ],
  //           },
  //         ],
  //       },

  //       userId: {
  //         id: "$userId",
  //         createdFor: "$createdFor",
  //         addressDetails: {
  //           area: {
  //             areaName: "$area.areaName",
  //             zoneName: "$area.zoneName",
  //           },
  //         },
  //       },
  //     },
  //   },

  //   { $skip: skip },
  //   { $limit: parseInt(limit) },
  // ];

  const tickets = await Ticket.aggregate(pipeline);
  // const tickets = await Ticket.aggregate(pipeline);
  const totalCount = await Ticket.countDocuments(match);

  // console.log("Tickets fetched:", Atickets);

  // If no status filter, return all
  if (!filter) {
    return successResponse(res, "All tickets fetched successfully", {
      totalCount,
      allTickets: tickets,
    });
  }

  // Categorize by status if filter is applied
  let openTickets = [],
    assignedTickets = [],
    nonAssignedTickets = [],
    fixedTickets = [],
    closedTickets = [],
    resolvedTickets = [],
    approvalTickets = [];

  tickets.forEach((t) => {
    switch (t.status) {
      case "Open":
        openTickets.push(t);
        break;
      case "Assigned":
        assignedTickets.push(t);
        break;
      case "NonAssigned":
        nonAssignedTickets.push(t);
        break;
      case "Fixed":
        fixedTickets.push(t);
        break;
      case "Closed":
        closedTickets.push(t);
        break;
      case "Resolved":
        resolvedTickets.push(t);
        break;
      case "Approval":
        approvalTickets.push(t);
        break;
    }
  });  

  successResponse(res, "Ticket list fetched successfully", {
    totalCount,
    openCount: openTickets.length,
    assignedCount: assignedTickets.length,
    nonAssignedCount: nonAssignedTickets.length,
    fixedCount: fixedTickets.length,
    closedCount: closedTickets.length,
    resolvedCount: resolvedTickets.length,
    approvalCount: approvalTickets.length,
    openTickets,
    assignedTickets,
    nonAssignedTickets,
    fixedTickets,
    closedTickets,
    resolvedTickets,
    approvalTickets,
  });
});
