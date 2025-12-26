const User = require("../../../models/user");
const bcrypt = require("bcryptjs");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

/* ───────────── CHANGE USER PASSWORD ───────────── */
exports.changeUserPassword = catchAsync(async (req, res, next) => {

  const { userId } = req.params;
  const { password } = req.body;     


    if (!userId || !password) {
        return next(new AppError("userId and password are required", 400));
    }       

    if (password.length < 6) {
        return next(new AppError("Password must be at least 6 characters long", 400));
    }

    const user = await User.findById(userId);       

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
user.generalInformation.password = hashedPassword;
  user.generalInformation.plainPassword = password;  

    await user.save();


    successResponse(res, "User password changed successfully", user);
}) ;