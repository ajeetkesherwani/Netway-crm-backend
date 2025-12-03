// const UserDueAmount = require("../../../models/userDueAmount");
// const User = require("../../../models/user");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const { successResponse } = require("../../../utils/responseHandler");


 
// // Get Due Amount / Payment History for the logged-in user
// exports.getPaidDueAmountHistoryDetails = catchAsync(async (req, res, next) => {
 
//   const userId = req.user._id;

//   const paymentId = req.params.paymentId
 
//   // Check if user exists
//   const user = await User.findById(userId)

//   if (!user) {
//     return next(new AppError("User not found", 404));
//   }
 
//   // Fetch all due/payment history for the user
//   const history = await UserDueAmount.find({ paymentId })
//   .populate("userId", "generalInformation.name generalInformation.username")
//   .sort({ createdAt: -1 });
 
//   return successResponse(res, "Your due payment history fetched successfully", history);
// });

const UserDueAmount = require("../../../models/userDueAmount");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

// Get Specific Paid / Due Payment Details using ID from Params
exports.getPaidDueAmountHistoryDetails = catchAsync(async (req, res, next) => {

  const userId = req.user._id;
  const paymentId = req.params.paymentId; // <-- Coming from URL like /payment/1234

  // Check user exists
  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  // Fetch specific payment history by _id
  const history = await UserDueAmount.findOne({ _id: paymentId, userId })
    .populate("userId", "generalInformation.name generalInformation.username");

  if (!history) return next(new AppError("No payment history found for this ID", 404));

  return successResponse(res, "Payment history fetched successfully", history);
});
