const Ticket = require("../../../models/ticket");
const Staff = require("../../../models/Staff");
const Retailer = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const User = require("../../../models/user");
const { sendTemplateSMS } = require("../../../utils/smsService");
const { sendWhatsappNotification } = require("../../../services/whatsappService");

exports.createTicket = catchAsync(async (req, res, next) => {
  const {
    userId,
    personName,
    personNumber,
    email,
    address,
    category,
    severity,
    callSource,
    fileI,
    fileII,
    fileIII,
    isChargeable,
    productId,
    price,
    callDescription,
    assignToId,
    assignToModel,
    serverType,
  } = req.body;

  // ✅ Step 1: Basic validation
  if (!userId || !personName || !personNumber || !severity) {
    return next(
      new AppError(
        " userId  personName, personNumber, and severity are required",
        400
      )
    );
  }

  // const ticketNumber = `TCKT-${Date.now()}`;
  // Generate ticket number WEB + 8 random digits
  const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
  const ticketNumber = `WEB${randomNumber}`;
  const userRole = req.user.role; // "Admin" | "Reseller" | "Lco"
  const creatorId = req.user._id;

  let finalAssignToId = null;
  let finalAssignToModel = null;
  let emp = null;

  // ✅ Step 2: Handle assignment role rules
  if (assignToId && assignToModel) {
    if (userRole === "Admin") {
      // Admin can assign only to Staff
      if (assignToModel !== "Staff") {
        return next(new AppError("Admin can assign only to Staff", 403));
      }
      finalAssignToId = assignToId;
      finalAssignToModel = "Staff";
      emp = await Staff.findById(assignToId).select("name phoneNo");
    } else if (userRole === "Reseller") {
      // Reseller can assign only to their own employees
      const reseller = await Retailer.findById(creatorId);
      if (!reseller) return next(new AppError("Reseller not found", 404));

      emp = reseller.employeeAssociation.id(assignToId);
      if (!emp) {
        return next(
          new AppError("You can assign tickets only to your own employees", 403)
        );
      }

      finalAssignToId = emp._id;
      finalAssignToModel = "Employee"; // "Admin" | "Manager" | "Operator"
    } else if (userRole === "Lco") {
      // Lco can assign only to their own employees
      const lco = await Lco.findById(creatorId);
      if (!lco) return next(new AppError("LCO not found", 404));

      emp = lco.employeeAssociation.id(assignToId);
      if (!emp) {
        return next(
          new AppError("You can assign tickets only to your own employees", 403)
        );
      }

      finalAssignToId = emp._id;
      finalAssignToModel = emp.type;
    } else {
      return next(new AppError("Unauthorized role to assign tickets", 403));
    }
  }

  let lcoId = null;
  let resellerId = null;

  const user = await User.findById(userId).select(
    "createdFor addressDetails.area addressDetails.subZone generalInformation.username generalInformation.UserId generalInformation.address generalInformation.state generalInformation.pincode addressDetails.installationAddress"
  );
  if (!user) return next(new AppError("User not found", 404));

  if (user.createdFor?.type === "Lco") {
    lcoId = user.createdFor?.id;
    const retailerOfLco = await Lco.findById(lcoId).select("retailerId");
    resellerId = retailerOfLco.retailerId;
  } else if (user.createdFor?.type === "Retailer") {
    resellerId = user.createdFor?.id;
  }

  const zoneId = user.addressDetails?.area;
  const subZoneId = user.addressDetails?.subZone;

  // ✅ Step 3: Create the ticket with all schema fields
  const newTicket = await Ticket.create({
    userId,
    ticketNumber,
    personName,
    personNumber,
    email,
    address,
    category,
    fileI,
    fileII,
    fileIII,
    callSource,
    severity,
    callDescription,
    isChargeable,
    productId,
    price,
    createdById: creatorId,
    createdByType: userRole,
    assignToId: finalAssignToId,
    assignToModel: finalAssignToModel,
    serverType,
    status: finalAssignToId ? "Assigned" : "Open",
    lcoId,
    resellerId,
    zoneId,
    subZoneId
  });

  // ✅ Step 4: Return complete ticket info
  const populatedTicket = await Ticket.findById(newTicket._id)
    .populate("category")
    .populate({
      path: "assignToId",
      select: "name email type employeeUserName",
    })
    .populate({
      path: "createdById",
      select: "resellerName email phoneNo",
    });

    // Send SMS to the customer about ticket creation
    await sendTemplateSMS(
        personNumber,
        "Complaint_has_been_registered",
        {
        ticketNo: ticketNumber, 
        }
    );

    // Send WhatsApp notification
    if (personNumber) {
        sendWhatsappNotification(personNumber, "create_ticket1", [ticketNumber])
            .catch(err => console.error("[WhatsApp] Notification failed in createTicket:", err.message));
    }

    // ✅ Send SMS and WhatsApp to Engineer if assigned
    const engPhone = emp ? (emp.phoneNo || emp.mobile || emp.mobileNo) : null;
    if (emp && engPhone) {
      const clientId = user?.generalInformation?.username || user?.generalInformation?.UserId || "N/A";
      const clientName = personName || "N/A";
      const ticketNo = ticketNumber || "N/A";
      const clientMobile = personNumber || "N/A";
      const clientAddress = address || user?.addressDetails?.installationAddress?.addressine1 || user?.generalInformation?.address || "N/A";
      
      const state = user?.addressDetails?.installationAddress?.state || user?.generalInformation?.state || "N/A";
      const pincode = user?.addressDetails?.installationAddress?.pincode || user?.generalInformation?.pincode || "N/A";
      const detail = callDescription ? `${callDescription}, State: ${state}, Pincode: ${pincode}` : `State: ${state}, Pincode: ${pincode}`;

      await sendTemplateSMS(
        engPhone,
        "A_complaint_assigned_to_Engineer",
        { 
          engineerName: emp.employeeName || emp.name || "Engineer",
          clientId: clientId,
          clientName: clientName,
          ticketNo: ticketNo,
          mobile: clientMobile,
          address: clientAddress,
          detail: detail,
        }
      ).catch(err => console.error("SMS failed to Engineer:", err.message));

      sendWhatsappNotification(
        String(engPhone), 
        "assign_complaint_engg1", 
        [String(clientId), String(clientName), String(ticketNo), String(clientMobile), String(clientAddress), String(detail)]
      ).catch(err => console.error("[WhatsApp] Notification failed for Engineer assignment:", err.message));
    }

  return successResponse(res, "Ticket created successfully", populatedTicket);
});
