const Ticket = require("../../../models/ticket");
const TicketReply = require("../../../models/ticketReply");
const TicketTimeline = require("../../../models/ticketHistoryTimeline");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

// exports.getTicketDetails = catchAsync(async (req, res, next) => {

//     const { ticketId } = req.params;
//     if (!ticketId) return next(new AppError("ticketId is required", 404));

//     const ticket = await Ticket.findById(ticketId).populate([
//         { path: "userId", select: "generalInformation.name generalInformation.email generalInformation.phone generalInformation.address isActive walletBalance" },
//         // { path: "assignToId", select: "name email phoneNo staffName" },
//         { path: "category", select: "name" },
//         { path: "createdById", select: "name" }
//     ]);

//     ticket.map(t => {
//         if (t.assignToModel === "Staff") {
//             return t.populate({ path: "assignToId", select: "name email phoneNo staffName" });
//         }
//         else if (t.assignToModel === "Reseller") {
//             return t.populate({ path: "assignToId", select: "name generalInformation.email generalInformation.phone" });
//         }
//         else if (t.assignToModel === "Lco") {
//             return t.populate({ path: "assignToId", select: "name generalInformation.email generalInformation.phone" });
//         }
//         else {
//             return t;
//         }
//     });
//     const ticketReplies = await TicketReply.find({ ticket: ticketId })
//         .populate("createdById","name")
//         .select("description createdAt createdBy");

//     const ticketTimeline = await TicketTimeline.find({ ticketId: ticketId })
//     .populate('activities.performedBy',"name");

//     if (!ticket) return next(new AppError("ticket not found", 404));

//     successResponse(res, "ticket Details found successfully", { ticket, replies: ticketReplies, timeline: ticketTimeline });

// });

exports.getTicketDetails = catchAsync(async (req, res, next) => {
  const { ticketId } = req.params;
  if (!ticketId) return next(new AppError("ticketId is required", 404));

  let ticket = await Ticket.findById(ticketId).populate([
    {
      path: "userId",
      select:
        "generalInformation.name generalInformation.email generalInformation.phone generalInformation.address isActive walletBalance",
    },
    { path: "category", select: "name" },
    // { path: "createdById", select: "name" },
  ]);

  if (!ticket) return next(new AppError("ticket not found", 404));


  // -----------------------------
  // ✅ Dynamic populate works HERE
  // -----------------------------
  if (ticket.assignToId && ticket.assignToModel) {
    let select = "";

    if (ticket.assignToModel === "Staff") {
      select = "name email phoneNo staffName";
    } else if (ticket.assignToModel === "Reseller" || ticket.assignToModel === "Lco") {
      select = "name generalInformation.email generalInformation.phone";
    } else if (ticket.assignToModel === "User") {
      select = "generalInformation.name generalInformation.email generalInformation.phone";
    } else {
      select = "name"; // fallback
    }

    await ticket.populate({ path: "assignToId", select });
  }

  const ticketReplies = await TicketReply.find({ ticket: ticketId })
    .populate("createdById", "name")
    .select("description createdAt createdBy");

  const ticketTimeline = await TicketTimeline.find({ ticketId })
    .populate("activities.performedBy", "name");

    // ✅ Dynamic populate (required to get name)
if (ticket.createdById && ticket.createdByType) {
  let select = "";

  if (ticket.createdByType === "Admin") {
    select = "name";
  } else if (ticket.createdByType === "Reseller || Retailer") {
    select = "resellerName";
  } else if (ticket.createdByType === "LCO") {
    select = "lcoName";
  } else if (ticket.createdByType === "User") {
    select = "generalInformation.name";
  } else {
    select = "name";
  }

  await ticket.populate({
    path: "createdById",
    model: ticket.createdByType,
    select,
  });
}

// ✅ Extract name
let createdByName = "N/A";

if (ticket.createdById) {
  switch (ticket.createdByType) {
    case "Admin":
      createdByName = ticket.createdById.name;
      break;

    case "Reseller":
      createdByName = ticket.createdById.resellerName;
      break;

    case "LCO":
      createdByName = ticket.createdById.lcoName;
      break;

    case "User":
      createdByName =
        ticket.createdById.generalInformation?.name;
      break;
  }
}

// ✅ ONLY ADD THIS LINE (no change anywhere else)
ticket._doc.createdByName = createdByName;

  successResponse(res, "ticket Details found successfully", {
    ticket,
    replies: ticketReplies,
    timeline: ticketTimeline,
  });
});
