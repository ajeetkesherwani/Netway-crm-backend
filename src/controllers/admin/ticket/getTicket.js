const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getTicketList = catchAsync(async (req, res, next) => {
    const { filter } = req.query;

    let query = {};


    if (filter) {
        if (filter !== "Assigned" && filter !== "NonAssigned"
            && filter !== "Fixed" && filter !== "Closed" && filter !== "Open" && filter !== "Resolved") {
            return next(new AppError("Invalid filter value. Use 'assigned' or 'nonAssigned'", 400));
        }
        query.status = filter;
    }

    const tickets = await Ticket.find(query).populate("assignToId", "name email phoneNo staffName");

    successResponse(res, "Ticket list fetched successfully", tickets);
});
