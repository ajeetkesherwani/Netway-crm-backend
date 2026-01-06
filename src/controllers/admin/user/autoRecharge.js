const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.toggleAutoRecharge = catchAsync(async (req, res, next) => {
    
  const { userId } = req.params;

  const user = await User.findById(userId).select("isAutoRecharge");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // 🔁 Toggle value
  user.isAutoRecharge = !user.isAutoRecharge;
  await user.save({ validateBeforeSave: false });

  successResponse(res, "Auto recharge status updated successfully", {
    isAutoRecharge: user.isAutoRecharge,
  });
});
