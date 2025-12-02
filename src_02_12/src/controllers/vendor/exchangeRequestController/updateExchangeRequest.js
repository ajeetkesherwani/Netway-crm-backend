const ExchangeRequest = require("../../../models/exchangeRequest");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateExchangeRequestStatus = catchAsync(async(req, res, next) => {

    // const vendorId = req.vendor._id;
    const vendorId = "686776e6704b90b34a4ac868";
    if(!vendorId) return next(new AppError("vendorId is required",400));

    const { id } = req.params;
    if(!id) return next(new  AppError("cxchange Request id is required", 400));

    const { status } = req.body;
    if(!status) return next(new AppError("status is required", 400));

    const updateStatus = ["approved", "rejected", "pickup_initiated", "received", "exchanged_completed"];
    if(!updateStatus.includes(status)){
        return next(new AppError("Invalid Status Value",400));
    }

    const updatedRequest = await ExchangeRequest.findOne({ _id: id, vendorId });
    if(!updatedRequest) return next(new AppError("exchangeRequest not found for this vendor",404));

    updatedRequest.status = status;

    await updatedRequest.save();

  successResponse(res, "exchange Requests status updated successfull", updatedRequest);

});