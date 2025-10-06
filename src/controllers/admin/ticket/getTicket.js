// const Ticket = require("../../../models/ticket");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getTicketList = catchAsync(async (req, res, next) => {

//     const { filter } = req.query;

//     let query = {};

//     if (filter) {
//         if (filter === "Assigned") {
//             query.status = "Assigned";
//         } else if (filter === "NonAssigned") {
//             query.status = "NonAssigned";
//         } else if (
//             filter === "Fixed" ||
//             filter === "Closed" ||
//             filter === "Open" ||
//             filter === "Resolved"
//         ) {
//             query.status = filter;
//         } else if (filter === "Manage") {
//             // return Open + Assigned + Approval tickets
//             query.$or = [
//                 { status: "Open" },
//                 { status: "Assigned" },
//                 { status: "Approval" }
//             ];
//         } else {
//             return next(
//                 new AppError(
//                     "Invalid filter value. Use 'Assigned', 'NonAssigned', 'Open', 'Closed', 'Fixed', 'Resolved'",
//                     400
//                 )
//             );
//         }
//     }

//     const tickets = await Ticket.find(query).populate(
//         "assignToId",
//         "name email phoneNo staffName"
//     );

//     successResponse(res, "Ticket list fetched successfully", tickets);
// });
const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getTicketList = catchAsync(async (req, res, next) => {
    const { filter } = req.query;

    // Predefine all arrays as empty
    let openTickets = [];
    let assignedTickets = [];
    let nonAssignedTickets = [];
    let fixedTickets = [];
    let closedTickets = [];
    let resolvedTickets = [];
    let approvalTickets = [];

    // Define projection: the fields to return
    const selectFields = "personName personNumber email address callSource status ticketNumber severity assignToId";

    // Define population
    const populateAssignTo = {
        path: "assignToId",
        select: "name email phoneNo staffName"
    };

    if (!filter || filter === "Manage") {
        [openTickets, assignedTickets, approvalTickets] = await Promise.all([
            Ticket.find({ status: "Open" })
                .select(selectFields)
                .populate(populateAssignTo),
            Ticket.find({ status: "Assigned" })
                .select(selectFields)
                .populate(populateAssignTo),
            Ticket.find({ status: "Approval" })
                .select(selectFields)
                .populate(populateAssignTo),
        ]);
    } else if (filter === "Assigned") {
        assignedTickets = await Ticket.find({ status: "Assigned" })
            .select(selectFields)
            .populate(populateAssignTo);
    } else if (filter === "NonAssigned") {
        nonAssignedTickets = await Ticket.find({ status: "NonAssigned" })
            .select(selectFields)
            .populate(populateAssignTo);
    } else if (filter === "Fixed") {
        fixedTickets = await Ticket.find({ status: "Fixed" })
            .select(selectFields)
            .populate(populateAssignTo);
    } else if (filter === "Closed") {
        closedTickets = await Ticket.find({ status: "Closed" })
            .select(selectFields)
            .populate(populateAssignTo);
    } else if (filter === "Open") {
        openTickets = await Ticket.find({ status: "Open" })
            .select(selectFields)
            .populate(populateAssignTo);
    } else if (filter === "Resolved") {
        resolvedTickets = await Ticket.find({ status: "Resolved" })
            .select(selectFields)
            .populate(populateAssignTo);
    } else {
        return next(
            new AppError(
                "Invalid filter value. Use 'Assigned', 'NonAssigned', 'Open', 'Closed', 'Fixed', 'Resolved', or 'Manage'",
                400
            )
        );
    }

    successResponse(res, "Ticket list fetched successfully", {
        openTickets,
        assignedTickets,
        nonAssignedTickets,
        fixedTickets,
        closedTickets,
        resolvedTickets,
        approvalTickets
    });
});

