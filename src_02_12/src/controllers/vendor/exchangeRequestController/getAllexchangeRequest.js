const ExchangeRequest = require("../../../models/exchangeRequest");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getAllExchangeRequest = catchAsync(async(req, res, next) => {

//    const vendorId = req.vendor?._id;
      const vendorId = "686776e6704b90b34a4ac868";
  
   if(!vendorId) return next(new AppError("vendorId is required", 400));

   const allExchange = await ExchangeRequest.find({ vendorId, status: "pending" });

   if(!allExchange) return next(new AppError("exchange request not found",404));

   successResponse(res, "all exchange Request found", allExchange);

});