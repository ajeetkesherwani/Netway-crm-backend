const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");
const Payment = require("../../../../models/payment");

exports.paymentReport = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Only count completed payments
  const totalPaymentData = await Payment.countDocuments({ paymentStatus: "Completed" });

  // Fetch paginated, populated results
  const paymentData = await Payment.find({ paymentStatus: "Completed" })
    .populate("userId", "generalInformation.name generalInformation.username") // Ensure this field exists in WebUser
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return successResponse(res, "Payments fetched successfully", {
    total: totalPaymentData,
    page: parseInt(page),
    limit: parseInt(limit),
    data: paymentData,
  });
});
