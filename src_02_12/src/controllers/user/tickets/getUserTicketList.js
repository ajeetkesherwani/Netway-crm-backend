// controllers/user/ticket/getUserTicketList.js

const Ticket = require("../../../models/ticket");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUserTicketList = catchAsync(async (req, res, next) => {
  const userId = req.user._id; // Logged-in user

  const tickets = await Ticket.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return successResponse(res, "User ticket list fetched successfully", tickets);
});
