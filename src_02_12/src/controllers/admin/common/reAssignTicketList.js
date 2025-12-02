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

const Ticket = require("../../../models/ticket");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAllReassignedTickets = catchAsync(async (req, res, next) => {
    // ✅ Find tickets that are currently assigned (Reassigned or Assigned)
    const tickets = await Ticket.find({
        assignToId: { $exists: true, $ne: null },
    })
        .select(
            "ticketNumber status personName personNumber email address callSource severity assignToId reassign createdAt updatedAt"
        )
        .populate({
            path: "assignToId",
            select: "name staffName email phoneNo",
        })
        .sort({ updatedAt: -1 });

    if (!tickets || tickets.length === 0) {
        return successResponse(res, "No currently assigned tickets found", { tickets: [] });
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
                name: ticket.assignToId.staffName || ticket.assignToId.name,
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
