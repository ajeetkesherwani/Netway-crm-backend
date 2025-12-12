const Ticket = require("../../../models/ticket");
const User = require("../../../models/user");
const Zone = require("../../../models/zone");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.filterTickets = catchAsync(async (req, res, next) => {
  const {
    userId,
    name,
    status,
    assignTo,
    isChargeable,
    callSource,
    zoneName,
    createdFrom,
    createdTo,
    updatedFrom,
    updatedTo
  } = req.query;

  let filter = {};

  //  Filter by userId
  if (userId) filter.userId = userId;

  // Filter by person name
  if (name) {
    filter.personName = { $regex: name, $options: "i" };
  }

  // Filter by status
  if (status) {
    filter.status = status;
  }

  //  Filter by assignToId
  if (assignTo) {
    filter.assignToId = assignTo;
  }

  // Filter by chargeable
  if (isChargeable !== undefined) {
    filter.isChargeable = isChargeable === "true";
  }

  //  Filter by call source
  if (callSource) {
    filter.callSource = callSource;
  }

  //Filter by zone name → find users → match tickets
  if (zoneName) {
    const zone = await Zone.findOne({
      name: { $regex: zoneName, $options: "i" }
    });

    if (!zone) return next(new AppError("Zone not found", 404));

    const userList = await User.find({
      "addressDetails.area": zone._id
    }).select("_id");

    filter.userId = { $in: userList.map((u) => u._id) };
  }

  // Created Date Range
  if (createdFrom || createdTo) {
    filter.createdAt = {};
    if (createdFrom) filter.createdAt.$gte = new Date(createdFrom);
    if (createdTo) filter.createdAt.$lte = new Date(createdTo);
  }

  // Updated Date Range
  if (updatedFrom || updatedTo) {
    filter.updatedAt = {};
    if (updatedFrom) filter.updatedAt.$gte = new Date(updatedFrom);
    if (updatedTo) filter.updatedAt.$lte = new Date(updatedTo);
  }

  const tickets = await Ticket.find(filter);


  return successResponse(res, "Filtered tickets fetched successfully", tickets);
});
