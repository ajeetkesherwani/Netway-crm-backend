const TicketReply = require("../../../models/ticketReply");
const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const mongoose = require("mongoose");
// const Staff = require("../../../models/staff");
// const Admin = require("../../../models/admin");
// const Reseller = require("../../../models/reseller");
// const Lco = require("../../../models/lco"); 

exports.ticketHistory = catchAsync(async (req, res, next) => {

    // const { ticketId } = req.params;

    // if (!ticketId) return next(new AppError("ticketId is required", 400));
    // const ticket = await Ticket.findById({_id: new mongoose.Types.ObjectId(ticketId)})
    //     console.log("Ticket Details:", ticket);
    //     if(ticket.assignToId){
    //         const AssisnModel = ticket.assignToModel;
    //         const assignToName = await AssisnModel.findById(ticket.assignToId);
    //         // const createdByName = await ticket.createdByType.findById(ticket.createdById);
    //         // const lastModifiedByName = ticket.lastModifiedByType ? await ticket.lastModifiedByType.findById(ticket.lastModifiedBy) : null;
        
    //         console.log("ticket.assignToModel",ticket.assignToModel);
    //         console.log("ticket.assignToId",ticket.assignToId);
    //         console.log("Assign To Name:", assignToName);
    //     }



    // if (!ticket || ticket.length === 0) {
    //     return next(new AppError("ticket not found", 404));
    // }

    // successResponse(res, "ticketReply list found", ticket);
});
