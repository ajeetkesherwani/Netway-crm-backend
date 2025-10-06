const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getTicketList = catchAsync(async (req, res, next) => {

    const { filter } = req.query;

    let query = {};

    if (filter) {
        if (filter === "Assigned") {
            query.status = "Assigned";
        } else if (filter === "NonAssigned") {
            query.status = "NonAssigned";
        } else if (
            filter === "Fixed" ||
            filter === "Closed" ||
            filter === "Open" ||
            filter === "Resolved"
        ) {
            query.status = filter;
        } else if (filter === "Manage") {
            // return Open + Assigned + Approval tickets
            query.$or = [
                { status: "Open" },
                { status: "Assigned" },
                { status: "Approval" }
            ];
        } else {
            return next(
                new AppError(
                    "Invalid filter value. Use 'Assigned', 'NonAssigned', 'Open', 'Closed', 'Fixed', 'Resolved'",
                    400
                )
            );
        }
    }

    const tickets = await Ticket.find(query).populate(
        "assignToId",
        "name email phoneNo staffName"
    );

    successResponse(res, "Ticket list fetched successfully", tickets);
});
