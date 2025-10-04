const Ticket = require("../../../models/ticket");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.createTicket = (async (req, res, next) => {

    const { userId, personName, personNumber, email, address,
        category, callSource, severity, assignToId, callDescription, isChargable, productId, price
    } = req.body;

    if (!userId) return next(new AppError("userId is required"), 404);

    const fileI = req.files.fileI ? req.files.fileI[0].filename : null;
    const fileII = req.files.fileII ? req.files.fileII[0].filename : null;
    const fileIII = req.files.fileIII ? req.files.fileIII[0].filename : null;

    // Generate ticket number WEB + 8 random digits
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const ticketNumber = `WEB${randomNumber}`;

    const newTicket = new Ticket({
        userId, personName, personNumber, email, address,
        category, callSource, severity, assignToId, callDescription, isChargable,
        productId, price, fileI, fileII, fileIII, ticketNumber
    });

    await newTicket.save();

    successResponse(res, "new Ticket is created successfully", newTicket);

});
