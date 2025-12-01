const Ticket = require("../../../models/ticket");
const Retailer = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const logTicketActivity = require("../../../utils/logTicketActivity");

exports.updateTicket = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  if (!ticketId) return next(new AppError("ticketId is required", 400));

  console.log("Request Body:", req.body);
  const {
    category,
    severity,
    isChargeable,
    price,
    callDescription,
    assignToId,
  } = req.body;

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) return next(new AppError("Ticket not found", 404));

  const userRole = req.user.role; // "Admin" | "Reseller" | "Lco"
  const updaterId = req.user._id;
  const assignToModel = 'Staff'; // Default, may change based on role
  const fileI = req.files && req.files['fileI'] ? req.files['fileI'][0].path : ticket.fileI;
  const fileII = req.files && req.files['fileII'] ? req.files['fileII'][0].path : ticket.fileII;
  const fileIII = req.files && req.files['fileIII'] ? req.files['fileIII'][0].path : ticket.fileIII;



  let finalAssignToId = ticket.assignToId;
  let finalAssignToModel = 'Staff';

  // ✅ Role-based reassignment logic (same as create)
  if (assignToId && assignToModel) {
    if (userRole === "Admin") {
      if (assignToModel !== "Staff") {
        return next(new AppError("Admin can assign only to Staff", 403));
      }
      finalAssignToId = assignToId;
      finalAssignToModel = "Staff";
    }

    else if (userRole === "Reseller") {
      const reseller = await Retailer.findById(updaterId);
      if (!reseller) return next(new AppError("Reseller not found", 404));

      const emp = reseller.employeeAssociation.id(assignToId);
      if (!emp) {
        return next(
          new AppError("You can assign tickets only to your own employees", 403)
        );
      }

      finalAssignToId = emp._id;
      finalAssignToModel = "Employee";
    }

    else if (userRole === "Lco") {
      const lco = await Lco.findById(updaterId);
      if (!lco) return next(new AppError("LCO not found", 404));

      const emp = lco.employeeAssociation.id(assignToId);
      if (!emp) {
        return next(
          new AppError("You can assign tickets only to your own employees", 403)
        );
      }

      finalAssignToId = emp._id;
      finalAssignToModel = emp.type;
    }

    else {
      return next(new AppError("Unauthorized role to assign tickets", 403));
    }
  }

  console.log("Final Assignment:", finalAssignToId, finalAssignToModel);
  console.log("Files:", { fileI, fileII, fileIII });
  


  // ✅ Update all editable fields
  ticket.category = category || ticket.category;
  ticket.severity = severity || ticket.severity;
  // ticket.callSource = callSource || ticket.callSource;
  ticket.fileI = fileI || ticket.fileI;
  ticket.fileII = fileII || ticket.fileII;
  ticket.fileIII = fileIII || ticket.fileIII;
  ticket.isChargeable = typeof isChargeable === "boolean" ? isChargeable : ticket.isChargeable;
  ticket.price = price || ticket.price;
  ticket.callDescription = callDescription || ticket.callDescription;
  ticket.assignToId = finalAssignToId;
  ticket.assignToModel = finalAssignToModel;

  // Track who last modified the ticket
  ticket.lastModifiedBy = updaterId;
  ticket.lastModifiedByType = userRole;

  await ticket.save();

  // ✅ Log ticket activity
  await logTicketActivity({
    ticketId,
    activityType: assignToId ? 2 : 1, // 1 = status update, 2 = reassignment
    performedBy: updaterId,
  });

  // ✅ Return populated ticket
  const populatedTicket = await Ticket.findById(ticket._id)
    .populate("category")
    .populate({
      path: "assignToId",
      select: "name email type employeeUserName",
    })
    .populate({
      path: "createdById",
      select: "resellerName email phoneNo",
    })
    .populate({
      path: "lastModifiedBy",
      select: "name email phoneNo",
    });

  return successResponse(res, "Ticket updated successfully", populatedTicket);
});
