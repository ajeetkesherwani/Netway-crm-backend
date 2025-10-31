const Pricebook = require("../../../models/priceBook");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPricebookDetails = catchAsync(async (req, res, next) => {

    const { pricebookId } = req.params;
    if (!pricebookId) return next(new AppError("pricebookid is requried", 400));


    const bookDetails = await Pricebook.findById(pricebookId).populate({
        path: "assignedTo",
        select: "resellerName"
    });

    if (!bookDetails) return next(new AppError("pricebook not found", 404));


    successResponse(res, "priceBookDetails details found successfully", bookDetails);

});