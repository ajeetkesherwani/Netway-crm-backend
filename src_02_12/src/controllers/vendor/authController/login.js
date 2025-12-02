const Vendor = require("../../../models/vendor");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { createToken } = require("../../../utils/createToken");
const bcrypt = require("bcrypt");

exports.login = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId || !password)
    return next(new AppError("User id and password are required.", 404));

  const vendor = await Vendor.findOne({ userId });

  if (!vendor || !(await bcrypt.compare(password, vendor.password))) {
    return next(new AppError("Invalid user id or password.", 400));
  }

  if (!vendor.status)
    return next(
      new AppError("You are not verified. Wait for verification", 400)
    );

  if (vendor.isBlocked) return next(new AppError("You are blocked", 400));

  createToken(vendor, 200, res);
});
