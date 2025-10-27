// const Pricebook = require("../../../models/priceBook");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.getPricebookDetails = catchAsync(async (req, res, next) => {

//     const { pricebookId } = req.params;
//     if (!pricebookId) return next(new AppError("pricebookid is requried", 400));


//     const bookDetails = await Pricebook.findById(pricebookId).populate({
//         path: "assignedTo",
//         select: "resellerName"
//     });

//     if (!bookDetails) return next(new AppError("pricebook not found", 404));


//     successResponse(res, "priceBookDetails details found successfully", bookDetails);

// });

const Pricebook = require("../../../models/priceBook");
const Retailer = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPricebookDetails = catchAsync(async (req, res, next) => {
    const { pricebookId } = req.params;
    if (!pricebookId) return next(new AppError("pricebookId is required", 400));

    // Step 1: get base details first
    const bookDetails = await Pricebook.findById(pricebookId).lean();
    if (!bookDetails) return next(new AppError("pricebook not found", 404));

    // Step 2: decide which model to populate dynamically
    let populatedAssignedTo = [];

    if (bookDetails.priceBookForModel === "Reseller") {
        populatedAssignedTo = await Retailer.find({
            _id: { $in: bookDetails.assignedTo }
        })
            .select("resellerName email mobileNo")
            .lean();
    } else if (bookDetails.priceBookForModel === "Lco") {
        populatedAssignedTo = await Lco.find({
            _id: { $in: bookDetails.assignedTo }
        })
            .select("lcoName")
            .lean();
    }

    // Step 3: merge populated assignedTo back into response
    const response = {
        ...bookDetails,
        assignedTo: populatedAssignedTo
    };

    successResponse(res, "priceBookDetails details found successfully", response);
});
