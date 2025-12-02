const UserDueAmount = require("../../../models/userDueAmount");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
 
// Get Due Amount / Payment History for the logged-in user
exports.getPaidDueAmountHistory = catchAsync(async (req, res, next) => {
 
  const userId = req.user._id;
 
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
 
  // Fetch all due/payment history for the user
  const history = await UserDueAmount.find({ userId }).sort({ createdAt: -1 });
 
  return successResponse(res, "Your due payment history fetched successfully", {
    walletBalance: user.walletBalance,
    history,
  });
});