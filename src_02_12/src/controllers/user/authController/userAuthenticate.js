const jwt = require("jsonwebtoken");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const User = require("../../../models/user");

exports.userAuthenticate = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.userToken) {
    token = req.cookies.userToken;
  }

  if (!token) return next(new AppError("You are not logged in.", 401));

  const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError("User does not exist.", 404));

  req.user = user;
  // console.log(req.user);
  next();
});
