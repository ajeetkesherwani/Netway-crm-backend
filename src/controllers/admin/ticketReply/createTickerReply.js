const TicketReply = require("../../../models/ticketReply");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const Ticket = require("../../../models/ticket");
const User = require("../../../models/user");
const { sendTemplateSMS } = require("../../../utils/smsService");

exports.createTicketReply = catchAsync(async (req, res, next) => {
    const { ticket, user, description } = req.body;

    if (!ticket) return next(new AppError("ticket Id is required", 400));
    if (!description) return next(new AppError("description is required", 400));

    const createdById = req.user?._id || null;
    const createdBy = req.user?.role || null;

    if (!createdById || !createdBy) {
        return next(new AppError("Unauthorized: no user found", 401));
    }

    const tReply = new TicketReply({
        ticket,
        user,
        description,
        createdBy,
        createdById
    });

    await tReply.save();

    
    // ---------------- SEND SMS ---------------- //

    try {

        // Get ticket
        const ticketData = await Ticket.findById(ticket);

        if (!ticketData) {
            console.log("Ticket not found for SMS");
        } else {

            //Get user using ticket.userId
            const userData = await User.findById(ticketData.userId);

            const mobile = userData?.generalInformation?.phone;

            if (mobile) {

                await sendTemplateSMS(
                    mobile,
                    "complaint has been registered",
                    {
                        ticketNo: ticketData.ticketNumber
                    }
                );

                console.log("Complaint SMS sent successfully");
            } else {
                console.log("User mobile not found");
            }
        }

    } catch (error) {
        console.log("SMS sending failed:", error.message);
    }

    successResponse(res, "Ticket reply created successfully", tReply);

});
