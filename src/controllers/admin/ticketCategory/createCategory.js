const TicketCategory = require("../../../models/ticketCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createCategory = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    if (!name) return next(new AppError("name is required", 404));

    // Get logged-in user's ID and role dynamically
    const createdById = req.user?._id || null;
    const createdBy = req.user?.role || null;

    if (!createdById || !createdBy) {
        return next(new AppError("Unauthorized: no user found", 401));
    }

    const category = new TicketCategory({
        name,
        createdBy,
        createdById
    });

    await category.save();

    successResponse(res, "Category created successfully", category);
});
