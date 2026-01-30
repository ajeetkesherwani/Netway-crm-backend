const { default: mongoose } = require("mongoose");
const Ticket = require("../../../models/ticket");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getTicketList = catchAsync(async (req, res) => {
  const {
    filter,
    page = 1,
    limit = 10,
    userSearch,
    ticketNumber,
    createdFrom,
    createdTo,
    fixedBy,
    category,
    assignTo,
    callSource,
    resellerId,
    lcoId,
    zoneId,
    subZoneId,
  } = req.query;

  // Build match conditions
  const match = {};

  // Status filter (for tabs like All, Closed, Assigned)
  if (filter && filter !== "Manage") {
    match.status = filter;
  }

  // Unified user search: matches name OR mobile OR email
  if (userSearch) {
    match.$or = [
      { personName: { $regex: userSearch, $options: "i" } },
      { personNumber: { $regex: userSearch, $options: "i" } },
      { email: { $regex: userSearch, $options: "i" } },
    ];
  }

  if (ticketNumber)
    match.ticketNumber = { $regex: ticketNumber, $options: "i" };
  if (callSource) match.callSource = callSource;

  // ✅ DATE FILTER (EXACT DAY OR RANGE)
  // Case 1: ONLY createdFrom → filter by createdAt (same day)
  if (createdFrom && !createdTo) {
    const start = new Date(createdFrom);
    start.setHours(0, 0, 0, 0);

    const end = new Date(createdFrom);
    end.setHours(23, 59, 59, 999);

    match.createdAt = { $gte: start, $lte: end };
  }

  // Case 2: ONLY createdTo → filter by updatedAt (same day)
  if (!createdFrom && createdTo) {
    const start = new Date(createdTo);
    start.setHours(0, 0, 0, 0);

    const end = new Date(createdTo);
    end.setHours(23, 59, 59, 999);

    match.updatedAt = { $gte: start, $lte: end };
  }
  if (assignTo) match.assignToId = { $regex: assignTo, $options: "i" };
  if (fixedBy) match.fixedBy = { $regex: fixedBy, $options: "i" };
  if (resellerId) match.resellerId = new mongoose.Types.ObjectId(resellerId);
  if (lcoId) match.lcoId = new mongoose.Types.ObjectId(lcoId);
  if (zoneId) {
    match.zoneId = new mongoose.Types.ObjectId(zoneId);
  }
if (subZoneId) {
    match.subZoneId = new mongoose.Types.ObjectId(subZoneId);
  }
  if (category) {
    match.category = new mongoose.Types.ObjectId(category);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const pipeline = [
    { $match: match },
      { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "ticketcategories",
        localField: "category",
        foreignField: "_id",
        as: "ticketCategory",
      },
    },
    {
      $unwind: { path: "$ticketCategory", preserveNullAndEmptyArrays: false },
    },

    {
      $addFields: {
        category: "$ticketCategory.name",
        resolution: "$ticketResolution.name",
      },
    },
    {
      $project: {
        ticketNumber: 1,
        personName: 1,
        personNumber: 1,
        email: 1,
        address: 1,
        callSource: 1,
        severity: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        assignToModel: 1,
        fixedByType: 1,
        fixedAt: 1,
        category: 1,
        resolution: 1,
      },
    },

    { $skip: skip },
    { $limit: parseInt(limit) },
  ];

  const tickets = await Ticket.aggregate(pipeline);
  // const tickets = await Ticket.aggregate(pipeline);
  const totalCount = await Ticket.countDocuments(match);

  // console.log("Tickets fetched:", Atickets);

  // If no status filter, return all
  if (!filter) {
    return successResponse(res, "All tickets fetched successfully", {
      totalCount,
      allTickets: tickets,
    });
  }

  // Categorize by status if filter is applied
  let openTickets = [],
    assignedTickets = [],
    nonAssignedTickets = [],
    fixedTickets = [],
    closedTickets = [],
    resolvedTickets = [],
    approvalTickets = [];

  tickets.forEach((t) => {
    switch (t.status) {
      case "Open":
        openTickets.push(t);
        break;
      case "Assigned":
        assignedTickets.push(t);
        break;
      case "NonAssigned":
        nonAssignedTickets.push(t);
        break;
      case "Fixed":
        fixedTickets.push(t);
        break;
      case "Closed":
        closedTickets.push(t);
        break;
      case "Resolved":
        resolvedTickets.push(t);
        break;
      case "Approval":
        approvalTickets.push(t);
        break;
    }
  });  

  successResponse(res, "Ticket list fetched successfully", {
    totalCount,
    openCount: openTickets.length,
    assignedCount: assignedTickets.length,
    nonAssignedCount: nonAssignedTickets.length,
    fixedCount: fixedTickets.length,
    closedCount: closedTickets.length,
    resolvedCount: resolvedTickets.length,
    approvalCount: approvalTickets.length,
    openTickets,
    assignedTickets,
    nonAssignedTickets,
    fixedTickets,
    closedTickets,
    resolvedTickets,
    approvalTickets,
  });
});
