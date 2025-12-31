// const Admin = require("../../../models/admin");
// const Ticket = require("../../../models/ticket");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getManageTicketList = catchAsync(async (req, res, next) => {
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


// controllers/ticketController.js (or your file name)

const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getManageTicketList = catchAsync(async (req, res, next) => {
  const { filter } = req.query;

  const selectFields = [
    "ticketNumber",
    "personName",
    "email",
    "phone",           
    "personNumber",   
    "address",
    "callSource",
    "severity",
    "status",
    "createdAt",
    "userId",
    "assignToId",
    "assignToModel",
    "category",
  ].join(" ");

  // Correct population: get zoneName and category name
  const populateOptions = [
    { path: "category", select: "name" },
    {
      path: "userId",
      select: "addressDetails.area",
      populate: {
        path: "addressDetails.area",
        select: "areaName zoneName _id",
      },
    },
    // Optional: get name of assigned person
    {
      path: "assignToId",
      select: "name staffName lcoName resellerName generalInformation.name",
    },
  ];

  // Helper to fetch tickets by status
  const fetchTicketsByStatus = async (status) => {
    return await Ticket.find({ status })
      .select(selectFields)
      .populate(populateOptions)
      .sort({ createdAt: -1 }) // newest first
      .lean(); // faster, plain objects
  };

  // Only handle the "Manage" filter for this page
  if (filter === "Manage") {
    const [openTickets, assignedTickets] = await Promise.all([
      fetchTicketsByStatus("Open"),
      fetchTicketsByStatus("Assigned"),
    ]);

    return successResponse(res, "Manage tickets fetched successfully", {
      openTickets,
      assignedTickets,
    });
  }

  // Optional: keep support for other filters if used elsewhere
  if (filter === "Open") {
    const openTickets = await fetchTicketsByStatus("Open");
    return successResponse(res, "Open tickets fetched", { openTickets });
  }

  if (filter === "Assigned") {
    const assignedTickets = await fetchTicketsByStatus("Assigned");
    return successResponse(res, "Assigned tickets fetched", { assignedTickets });
  }

 
  return next(
    new AppError("Please use ?filter=Manage to access the manage ticket page data.", 400)
  );
});