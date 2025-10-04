const TicketCategory = require("../../../models/ticketCategory");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.createCategory = (async (req, res, next) => {

    const { name } = req.body;
    if (!name) return next(new AppError("name is required", 404));

    const category = new TicketCategory({ name });

    await category.save();

    successResponse(res, "Category created successfully", category);

});

