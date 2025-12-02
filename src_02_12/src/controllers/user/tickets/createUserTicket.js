const Ticket = require("../../../models/ticket");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

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

  return successResponse(res, "Ticket created successfully", ticket);
});
