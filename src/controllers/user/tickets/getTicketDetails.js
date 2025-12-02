// // const Ticket = require("../../../models/ticket");
// // const AppError = require("../../../utils/AppError");
// // const catchAsync = require("../../../utils/catchAsync");
// // const { successResponse } = require("../../../utils/responseHandler");

// // exports.getUserTicketDetails = catchAsync(async (req, res, next) => {
// //     const userId = req.user._id; 
// //     const ticketId = req.params.ticketId;


// //     // Find ticket for logged-in user only
// //     const ticket = await Ticket.findOne({
// //         _id: ticketId,
// //         userId: userId
// //     })
// //     .populate("category", "name")      
// //     .lean();

// //     console.log("Fetched Ticket:", ticket);

// //     if (!ticket) {
// //         return next(new AppError("Ticket not found or unauthorized", 404));
// //     }

// //     return successResponse(res, "Ticket details fetched successfully", ticket);
// // });


// const Ticket = require("../../../models/ticket");
// const TicketReply = require("../../../models/ticketReply");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getUserTicketDetails = catchAsync(async (req, res, next) => {
//   const userId = req.user._id; 
//   const ticketId = req.params.ticketId;

//   // Ticket fetch
//   const ticket = await Ticket.findOne({
//     _id: ticketId,
//     userId: userId
//   })
//   .populate("category", "name")
//   .lean();

//   if (!ticket) {
//     return next(new AppError("Ticket not found or unauthorized", 404));
//   }

//   // Ticket replies fetch (without modifying ticket schema)
//    const replies = await TicketReply.find({
//     ticket: ticketId,
//     // createdById: userId
//   }).populate("createdBy", "generalInfotmation.name")
//   .lean();

//   // Send ticket and replies separately in response
//   return successResponse(res, "Ticket details with replies fetched successfully", {
//     ticket,
//     replies
//   });
// });



// const Ticket = require("../../../models/ticket");
// const TicketReply = require("../../../models/ticketReply");
// const User = require("../../../models/user");
// const Admin = require("../../../models/admin");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getUserTicketDetails = catchAsync(async (req, res, next) => {
//   const userId = req.user._id;
//   const ticketId = req.params.ticketId;

//   // Fetch ticket of logged-in user
//   const ticket = await Ticket.findOne({
//     _id: ticketId,
//     userId
//   })
//     .populate("category", "name")
//     .lean();

//   if (!ticket) {
//     return next(new AppError("Ticket not found or unauthorized", 404));
//   }

//   // Fetch all replies
//   let replies = await TicketReply.find({ ticket: ticketId }).populate("createdById").lean();
//   console.log("Fetched Replies:", replies);




//   // 🔥 Dynamically attach name (Admin/User)
//   for (let reply of replies) {
//     if(reply.createdBy === "User" || reply.createdBy === "Staff" || reply.createdBy === "Admin"){
//            reply.createdBy = reply.staffName || reply.generalInformation.name || reply.name;
//     }
//     if(reply.createdBy === "Reseller"){
//       //
//     }

//     if(reply.createdBy === "Lco"){
//       //
//     }
 
//     // if (reply.createdBy === "User") {
//     //   reply.createdBy = await User.findById(reply.createdById)
//     //     .select("generalInformation.name")
//     //     .lean();
//     // } else if (reply.createdBy === "Admin") {
//     //   reply.createdBy = await Admin.findById(reply.createdById)
//     //     .select("name")
//     //     .lean();
//     // }
//   }

//   return successResponse(
//     res,
//     "Ticket details with replies fetched successfully",
//     { ticket, replies }
//   );
// });


// const Ticket = require("../../../models/ticket");
// const TicketReply = require("../../../models/ticketReply");
// const User = require("../../../models/user");
// const Admin = require("../../../models/admin");
// // const Retailer = require("../../../models/");
// // const Lco = require("../../../models/lcoModel");
// const Retailer = require("../../../models/retailer");
// const Lco = require("../../../models/lco");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getUserTicketDetails = catchAsync(async (req, res, next) => {
//   const userId = req.user._id;
//   const ticketId = req.params.ticketId;

//   // ✔ Fetch ticket
//   const ticket = await Ticket.findOne({
//     _id: ticketId,
//     userId
//   })
//     .populate("category", "name")
//     .lean();

//   if (!ticket) {
//     return next(new AppError("Ticket not found or unauthorized", 404));
//   }

//   // ✔ Fetch replies
//   let replies = await TicketReply.find({ ticket: ticketId })
//     .populate("createdById")
//     .lean();

//   console.log("Fetched Replies:", replies);

//   // ✔ If no reply → return empty array
//   if (!replies || replies.length === 0) {
//     return successResponse(
//       res,
//       "Ticket details with replies fetched successfully",
//       { ticket, replies: [] }
//     );
//   }

//   // ✔ Apply mapping
//   for (let reply of replies) {

//     if (["User", "Staff", "Admin"].includes(reply.createdBy)) {
//       reply.createdBy =
//         reply.staffName ||
//         reply.generalInformation?.name ||
//         reply.name ||
//         "Unknown";
//       continue;
//     }

//     if (reply.createdBy === "Reseller") {
//       const reseller = await Retailer.findOne(
//         { "employeeAssociation._id": reply.createdById },
//         { "employeeAssociation.$": 1 }
//       ).lean();

//       if (reseller?.employeeAssociation?.length > 0) {
//         reply.createdBy = reseller.employeeAssociation[0].employeeName;
//       } else {
//         reply.createdBy = "Unknown";
//       }
//       continue;
//     }

//     if (reply.createdBy === "Lco") {
//       const lco = await Lco.findOne(
//         { "employeeAssociation._id": reply.createdById },
//         { "employeeAssociation.$": 1 }
//       ).lean();

//       if (lco?.employeeAssociation?.length > 0) {
//         reply.createdBy = lco.employeeAssociation[0].employeeName;
//       } else {
//         reply.createdBy = "Unknown";
//       }
//       continue;
//     }

//     reply.createdBy = "Unknown";
//   }

//   return successResponse(
//     res,
//     "Ticket details with replies fetched successfully",
//     { ticket, replies }
//   );
// });


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
});
