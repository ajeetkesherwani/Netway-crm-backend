const jwt = require("jsonwebtoken");
const Driver = require("../../../models/driver");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.driverAuthenticate = catchAsync(async (req, res, next) => {

    let token;

    if (req.headers.authorization && req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.xcvbexamstons) {
        token = req.headers?.xcvbexamstons;
    }

    if (!token) return next(new AppError("you are not loggedIn", 404));

    const decode = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

    const driver = await Driver.findById(decode.id);
    if (!driver) return next(new AppError("Driver not exist", 404));

    req.driver = driver;
    next();

});
