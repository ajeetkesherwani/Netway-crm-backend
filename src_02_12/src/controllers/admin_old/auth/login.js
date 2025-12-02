const bcrypt = require("bcrypt");
const Admin = require("../../../models_old/admin");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const createToken = require("../../../utils/createToken");

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);
  console.log(email, password);
  if (!email || !password)
    return next(new AppError("Email and password are required.", 400));

  const admin = await Admin.findOne({ email }).populate("role");

  if (!admin) {
    return next(new AppError("Invalid email or password.", 401));
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return next(new AppError("Invalid email or password.", 401));
  }

  createToken(admin, 200, res); // ensures populated role is included in response
});
