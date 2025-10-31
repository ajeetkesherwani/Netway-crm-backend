const ExchangeRequest = require("../../../models/exchangeRequest");
const SubOrder = require("../../../models/SubOrder");
const validateRequiredFields = require("../../../utils/validateRequiredFields");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.createExchangeRequests = catchAsync(async (req, res, next) => {

    const userId = req.user._id;
    console.log(userId);

    const {
        subOrderId,
        mainOrderId,
        productId,
        originalVariantTypeId,
        requestedVariantTypeId,
        exchangeReason,
    } = req.body;

    console.log(subOrderId)
    const requiredFields = [
        { field: subOrderId, name: "SubOrderId" },
        { field: mainOrderId, name: "MainOrderId" },
        { field: productId, name: "ProductId" },
        { field: originalVariantTypeId, name: "OrignVariantTypeId" },
        { field: requestedVariantTypeId, name: "RequestedVariantTypeId" },
        { field: exchangeReason, name: "Exchange Reason" },
    ];

    let error = validateRequiredFields(requiredFields);
    if (error) return next(error);

    const subOrder = await SubOrder.findOne({ _id: subOrderId, mainOrderId, "products.productId": productId });
    if (!subOrder) return next(new AppError("Invalid SubOrder or Product not found in suborder", 404));

    if (subOrder.status !== "delivered") {
        return next(new AppError("Exchange allowed only after product is delivered", 400));
    }

    const vendorId = subOrder.vendorId;

    const images = (req.files?.uploadFiles || []).map(
        (file) => `/uploads/exchangeOrder/${file.filename}`
    );
    if (!images) return next(new AppError("images is required", 400));

    const newExchange = await ExchangeRequest.create({
        userId,
        vendorId,
        subOrderId,
        mainOrderId,
        productId,
        originalVariantTypeId,
        requestedVariantTypeId,
        exchangeReason,
        uploadFiles: images
    });

    successResponse(res, "Exchange request submitted", newExchange);

});