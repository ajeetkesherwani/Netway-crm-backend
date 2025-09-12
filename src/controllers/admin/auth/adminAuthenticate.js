const jwt = require("jsonwebtoken");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const Admin = require("../../../models/user");

exports.adminAuthenticate = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization?.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookie?.xcvbexamstons) {
    token = req.cookie?.xcvbexamstons;
  }

  if (!token) return next(new AppError("You are not loggedin.", 401));

  const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

  const admin = await Admin.findById(decoded.id);
  if (!admin) return next(new AppError("Admin not exist.", 404));

  req.admin = admin;
  next();
});
