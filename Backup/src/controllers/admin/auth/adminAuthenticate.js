const jwt = require("jsonwebtoken");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const Admin = require("../../../models/admin");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");

// adminAuthenticate.js
exports.adminAuthenticate = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.xcvbexamstons) {
    token = req.cookies.xcvbexamstons;
  }

  if (!token) {
    return next(new AppError("You are not logged in.", 401));
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }

  // Find user and set role correctly
  let user, role;

  const admin = await Admin.findById(decoded.id);
  if (admin) {
    user = admin;
    role = "Admin";
  } else {
    const reseller = await Reseller.findById(decoded.id);
    if (reseller) {
      user = reseller;
      role = "Reseller";
    } else {
      const lco = await Lco.findById(decoded.id);
      if (lco) {
        user = lco;
        role = "Lco";
      }
    }
  }

  if (!user) {
    return next(new AppError("User does not exist.", 404));
  }

  req.user = {
    _id: user._id,
    role,
    name: user.name || user.resellerName || user.lcoName || "Unknown"
  };

  next();
});
