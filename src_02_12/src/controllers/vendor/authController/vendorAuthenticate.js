const jwt = require("jsonwebtoken");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const Vendor = require("../../../models_old/vendor");

exports.vendorAuthenticate = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization?.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookie?.xcvbexamstons) {
    token = req.cookie?.xcvbexamstons;
  }

  if (!token) return next(new AppError("You are not loggedin.", 404));

  const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

  const vendor = await Vendor.findById(decoded.id);
  if (!vendor) return next(new AppError("Vendor not exist.", 404));

  req.vendor = vendor;
   
  next();
});
