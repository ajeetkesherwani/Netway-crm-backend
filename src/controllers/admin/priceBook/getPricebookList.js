const PriceBook = require("../../../models/priceBook");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPricebookList = catchAsync(async (req, res, next) => {
    const priceBooks = await PriceBook.find()
        .populate({
            path: "assignedTo",
            select: "resellerName"
        });

    const data = priceBooks.map(pb => ({
        ...pb.toObject(),
        assignedCount: pb.assignedTo.length
    }));

    successResponse(res, "pricebook list", data);
});
