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

const Ticket = require("../../../models/ticket");
const TicketReply = require("../../../models/ticketReply");
const User = require("../../../models/user");
const Admin = require("../../../models/admin");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getUserTicketDetails = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const ticketId = req.params.ticketId;

  // Fetch ticket of logged-in user
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
  let replies = await TicketReply.find({ ticket: ticketId }).populate("createdById").lean();
  console.log("Fetched Replies:", replies);




  // 🔥 Dynamically attach name (Admin/User)
  for (let reply of replies) {
    if(reply.createdBy === "User" || reply.createdBy === "Staff" || reply.createdBy === "Admin"){
           reply.createdBy = reply.staffName || reply.generalInformation.name || reply.name;
    }
    if(reply.createdBy === "Reseller"){
      //
    }

    if(reply.createdBy === "Lco"){
      //
    }
 
    // if (reply.createdBy === "User") {
    //   reply.createdBy = await User.findById(reply.createdById)
    //     .select("generalInformation.name")
    //     .lean();
    // } else if (reply.createdBy === "Admin") {
    //   reply.createdBy = await Admin.findById(reply.createdById)
    //     .select("name")
    //     .lean();
    // }
  }

  return successResponse(
    res,
    "Ticket details with replies fetched successfully",
    { ticket, replies }
  );
});
