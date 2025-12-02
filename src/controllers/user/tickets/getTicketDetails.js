const Ticket = require("../../../models/ticket");
const TicketReply = require("../../../models/ticketReply");
const User = require("../../../models/user");
const Admin = require("../../../models/admin");
const Retailer = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const Staff = require("../../../models/Staff")
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
 
exports.getUserTicketDetails = catchAsync(async (req, res, next) => {
 
  try {
    const userId = req.user._id;
  const ticketId = req.params.ticketId;
 
  // Fetch ticket
  const ticket = await Ticket.findOne({
    _id: ticketId,
    userId
  })
    .populate("category", "name")
    .lean();
 
  if (!ticket) {
    return next(new AppError("Ticket not found or unauthorized", 404));
  }
 
  // Fetch all replies
  let replies = await TicketReply.find({ ticket: ticketId }).lean();
 
  const finalReplies = [];
 
  for (let reply of replies) {
    let name = "Unknown";
 
    // ============================
    // USER
    // ============================
    if (reply.createdBy === "User") {
      const user = await User.findById(reply.createdById)
        .select("generalInformation.name")
        .lean();
      name = user?.generalInformation?.name || "Unknown";
    }
 
    // ============================
    // STAFF → from User model
    // ============================
    else if (reply.createdBy === "Staff") {
      const staff = await Staff.findById(reply.createdById)
        .select("staffName")
        .lean();
      name = staff?.staffName|| reply.staffName || "Unknown";
    }
 
    // ============================
    // ADMIN
    // ============================
    else if (reply.createdBy === "Admin") {
      const admin = await Admin.findById(reply.createdById)
        .select("name")
        .lean();
      name = admin?.name || "Unknown";
    }
 
    // ============================
    // RESELLER EMPLOYEE
    // ============================
    else if (reply.createdBy === "Reseller") {
      const reseller = await Retailer.findOne(
        { "employeeAssociation._id": reply.createdById },
        { "employeeAssociation.$": 1 }
      ).lean();
      name = reseller?.employeeAssociation?.[0]?.employeeName || "Unknown";
    }
 
    // ============================
    // LCO EMPLOYEE
    // ============================
    else if (reply.createdBy === "Lco") {
      const lco = await Lco.findOne(
        { "employeeAssociation._id": reply.createdById },
        { "employeeAssociation.$": 1 }
      ).lean();
      name = lco?.employeeAssociation?.[0]?.employeeName || "Unknown";
    }
 
    finalReplies.push({
      _id: reply._id,
      description: reply.description,
      createdAt: reply.createdAt,
      createdBy: name,
      createdById: reply.createdById, // ✅ added this
       createdByType: reply.createdBy
    });
  }
 
  return successResponse(
    res,
    "Ticket details fetched successfully",
    { ticket, replies: finalReplies }
  );
  } catch (err) {
    console.error("Error logging request details:", err);
  }
 
});