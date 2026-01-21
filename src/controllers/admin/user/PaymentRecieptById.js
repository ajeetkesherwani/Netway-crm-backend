const Payment = require("../../../models/payment");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getPaymentReceiptDetails = catchAsync(async (req, res, next) => {
  const { userId, receiptId } = req.params;

  if (!userId || !receiptId) {
    return next(new AppError("userId and receiptId are required", 400));
  }

  const receipt = await Payment.findOne({
    _id: receiptId,
    userId: userId
  });

  if (!receipt) {
    return next(new AppError("Receipt not found", 404));
  }

  return successResponse(
    res,
    "Payment receipt found successfully",
    receipt
  );
});
