const jwt = require("jsonwebtoken");

const createToken = (user, statusCode, res, verify = false) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
  };

  if (!verify) {
    res.cookie("xcvbexamstons", token, cookieOptions);

    res.status(statusCode).json({
      success: true,
      token,
      data: {
        user: user.toJSON(),
      },
    });
  }

  if (verify) {
    res.cookie("sfvbexamstons", token, cookieOptions);

    res.status(statusCode).json({
      success: true,
      message: "Otp verify Successfully.",
      token,
      data: {
        user,
      },
      isRegistered: verify.isRegistered,
    });
  }
};

module.exports = createToken;
