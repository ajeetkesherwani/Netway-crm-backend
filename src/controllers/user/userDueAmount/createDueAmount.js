const UserDueAmount = require("../../../models/userDueAmount");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createUserDueAmountPayment = catchAsync(async (req, res, next) => {

  const { userId, amount, modeOfPayment } = req.body;

  if (!userId || amount === undefined) {
    return next(new AppError("userId and amount are required", 400));
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Current due from walletBalance (negative value)
  const currentDue = user.walletBalance < 0 ? -user.walletBalance : 0;

  if (currentDue === 0) {
    return next(new AppError("No due amount pending", 400));
  }

  if (amount > currentDue) {
    return next(new AppError(`Payment cannot be more than due amount (${currentDue})`, 400));
  }

  // Update walletBalance after payment
  user.walletBalance += amount; // Reduces debt since walletBalance is negative
  await user.save();

  // Create due/payment history record
  const dueRecord = await UserDueAmount.create({
    userId,
    dueAmount: amount, 
    modeOfPayment: modeOfPayment || 'Online', 
    status: "Paid"
  });

  return successResponse(res, "Payment recorded successfully", {
    walletBalance: user.walletBalance, 
    dueRecord,
  });
});
