const Ticket = require("../../../models/ticket");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const { createLog } = require("../../../utils/userLogActivity");

exports.createUserTicket = catchAsync(async (req, res, next) => {
  
  const userId = req.user._id;

  const user = await User.findById(userId).lean();
  console.log(user, "user---");
  // Generate unique ticket number
  const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
  const ticketNumber = `WEB${randomNumber}`;

  const {
    category,
    callDescription
  } = req.body;

  const ticket = await Ticket.create({
    userId,
    ticketNumber,
    personName:user.generalInformation.name,
    personNumber:user.generalInformation.phone,
    email:user.generalInformation.email,
    address: user.generalInformation.address,
    category,
    callSource: "MobileApp",
    callDescription,
    createdById: userId,
    createdByType: "User",
  });

  await createLog({
    userId,
    type: "Ticket Created",
    description: `Ticket ${ticketNumber} created by customer ${user.generalInformation?.name || userId}`,
    details: {
      ticketId: ticket._id,
      ticketNumber,
      customerName: user.generalInformation?.name,
      createdById: userId,
      createdByRole: "User",
      status: ticket.status,
      category,
      callDescription,
    },
    addedBy: { id: userId, role: "User" },
    ip: req.ip || req.headers["x-forwarded-for"],
    module: "ticket",
    targetType: "ticket",
    targetId: ticket._id,
    targetName: ticketNumber,
  });

  return successResponse(res, "Ticket created successfully", ticket);
});
