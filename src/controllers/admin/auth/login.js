const bcrypt = require("bcrypt");
const Admin = require("../../../models/admin");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const createToken = require("../../../utils/createToken");

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required.", 400));
  }

  let user = await Admin.findOne({ email }).populate("role");
  let userType = "admin";

  if (!user) {
    user = await Reseller.findOne({ email }).populate("role");
    userType = "reseller";
  }

  if (!user) {
    user = await Lco.findOne({ email }).populate("role");
    userType = "lco";
  }

  if (!user) {
    user = await Staff.findOne({ email }).populate("role");
    userType = "staff";
  }

  if (!user) {
    return next(new AppError("Invalid email or password.", 401));
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError("Invalid email or password.", 401));
  }

  // Generate token
  createToken(user, 200, res);

});
