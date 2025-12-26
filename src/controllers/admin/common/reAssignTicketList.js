// const Ticket = require("../../../models/ticket");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");
// const AppError = require("../../../utils/AppError");

// exports.getAllReassignedTickets = catchAsync(async (req, res, next) => {
//     // ✅ Find all tickets with status "Reassigned"
//     const tickets = await Ticket.find({ status: "Reassigned" })
//         .select(
//             "ticketNumber status personName personNumber email address callSource severity assignToId reassign createdAt updatedAt"
//         )
//         .populate([
//             {
//                 path: "assignToId",
//                 select: "name staffName email phoneNo",
//             },
//             {
//                 path: "reassign.staffId",
//                 select: "name staffName email phoneNo",
//             },
//         ])
//         .sort({ updatedAt: -1 });

//     if (!tickets || tickets.length === 0) {
//         return successResponse(res, "No reassigned tickets found", { tickets: [] });
//     }

//     // ✅ Format final response
//     const formattedTickets = tickets.map((ticket) => {
//         const lastReassign =
//             ticket.reassign && ticket.reassign.length > 0
//                 ? ticket.reassign[ticket.reassign.length - 1] // latest record
//                 : null;

//         return {
//             _id: ticket._id,
//             ticketNumber: ticket.ticketNumber,
//             severity: ticket.severity,
//             currentStatus: ticket.status,
//             createdAt: ticket.createdAt,
//             updatedAt: ticket.updatedAt,

//             // 👤 User Info
//             user: {
//                 name: ticket.personName,
//                 email: ticket.email,
//                 phoneNo: ticket.personNumber,
//                 address: ticket.address,
//                 callSource: ticket.callSource,
//             },

//             // 🧑‍🔧 Currently Assigned Staff
//             currentAssignee: ticket.assignToId
//                 ? {
//                     id: ticket.assignToId._id,
//                     name: ticket.assignToId.staffName || ticket.assignToId.name,
//                     email: ticket.assignToId.email,
//                     phoneNo: ticket.assignToId.phoneNo,
//                 }
//                 : null,

//             // 🔁 Last Reassign Info
//             lastReassign: lastReassign
//                 ? {
//                     previousStaff: lastReassign.staffId
//                         ? {
//                             id: lastReassign.staffId._id,
//                             name:
//                                 lastReassign.staffId.staffName ||
//                                 lastReassign.staffId.name,
//                             email: lastReassign.staffId.email,
//                             phoneNo: lastReassign.staffId.phoneNo,
//                         }
//                         : null,
//                     previousStatus: lastReassign.currentStatus,
//                     assignedAt: lastReassign.assignedAt,
//                 }
//                 : null,
//         };
//     });

//     // ✅ Send response
//     successResponse(res, "All reassigned tickets fetched successfully", {
//         total: formattedTickets.length,
//         tickets: formattedTickets,
//     });
// });

const { default: mongoose } = require("mongoose");
const Ticket = require("../../../models/ticket");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const sanitizeSearchQuery = require("../../../utils/sanitizeSearchQuery");

exports.getAllReassignedTickets = catchAsync(async (req, res, next) => {
  // ✅ Find tickets that are currently assigned (Reassigned or Assigned)
  const {
    page,
    limit,
    userSearch,
    ticketNumber,
    createdFrom,
    createdTo,
    zoneId,
    fixedBy,
    category,
    assignTo,
    callSource,
    lcoId,
    resellerId,
  } = req.query;

  const matchQuery = {};
  const safeSearch = sanitizeSearchQuery(userSearch);
  if (safeSearch) {
    matchQuery.$or = [
      { personName: { $regex: safeSearch, $options: "i" } },
      { personNumber: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const safeTicketNumber = sanitizeSearchQuery(ticketNumber);
  if (safeTicketNumber)
    matchQuery.ticketNumber = { $regex: safeTicketNumber, $options: "i" };
  if (callSource) matchQuery.callSource = callSource;

  if (createdFrom && !createdTo) {
    const start = new Date(createdFrom);
    start.setHours(0, 0, 0, 0);

    const end = new Date(createdFrom);
    end.setHours(23, 59, 59, 999);

    match.matchQuery = { $gte: start, $lte: end };
  }

  if (!createdFrom && createdTo) {
    const start = new Date(createdTo);
    start.setHours(0, 0, 0, 0);

    const end = new Date(createdTo);
    end.setHours(23, 59, 59, 999);

    matchQuery.updatedAt = { $gte: start, $lte: end };
  }

  if (assignTo) matchQuery.assignToId = { $regex: assignTo, $options: "i" };
  if (fixedBy) matchQuery.fixedBy = { $regex: fixedBy, $options: "i" };
  if (resellerId)
    matchQuery.resellerId = new mongoose.Types.ObjectId(resellerId);
  if (lcoId) matchQuery.lcoId = new mongoose.Types.ObjectId(lcoId);
  if (zoneId) {
    matchQuery.zoneId = new mongoose.Types.ObjectId(zoneId);
  }
  if (category) {
    matchQuery.category = new mongoose.Types.ObjectId(category);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const tickets = await Ticket.find({
    ...matchQuery,
    assignToId: { $exists: true, $ne: null },
  })
    .select(
      "ticketNumber status personName personNumber email address callSource severity assignToId reassign createdAt updatedAt assignToModel"
    )
    .populate({
      path: "assignToId",
      select: "name staffName email phoneNo resellerName lcoName",
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  if (!tickets || tickets.length === 0) {
    return successResponse(res, "No currently assigned tickets found", {
      tickets: [],
    });
  }

  // ✅ Format response
  const formattedTickets = tickets.map((ticket) => {
    // find the latest assignedAt (from last reassign entry, if any)
    const lastReassign =
      ticket.reassign && ticket.reassign.length > 0
        ? ticket.reassign[ticket.reassign.length - 1]
        : null;

    const currentAssignee = ticket.assignToId
      ? {
          id: ticket.assignToId._id,
          name:
            ticket.assignToId.staffName ||
            ticket.assignToId.name ||
            ticket.assignToId.lcoName ||
            ticket.assignToId.resellerName,
          email: ticket.assignToId.email,
          phoneNo: ticket.assignToId.phoneNo,
          assignedAt: lastReassign ? lastReassign.assignedAt : ticket.createdAt,
          currentStatus: ticket.status, // ✅ Current ticket status here
        }
      : null;

    return {
      _id: ticket._id,
      ticketNumber: ticket.ticketNumber,
      severity: ticket.severity,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,

      // 👤 User info
      user: {
        name: ticket.personName,
        email: ticket.email,
        phoneNo: ticket.personNumber,
        address: ticket.address,
        callSource: ticket.callSource,
      },

      // 🧑‍🔧 Current assigned staff with current status
      currentAssignee,
    };
  });

  // ✅ Send formatted response
  successResponse(res, "All currently assigned tickets fetched successfully", {
    total: formattedTickets.length,
    tickets: formattedTickets,
  });
});
