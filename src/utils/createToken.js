// const jwt = require("jsonwebtoken");

// const createToken = (user, statusCode, res, verify = false) => {
//   const token = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET);

//   const cookieOptions = {
//     httpOnly: true,
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000
//     ),
//   };

//   if (!verify) {
//     res.cookie("xcvbexamstons", token, cookieOptions);

//     res.status(statusCode).json({
//       success: true,
//       token,
//       data: {
//         user: user.toJSON(),
//       },
//     });
//   }

//   if (verify) {
//     res.cookie("sfvbexamstons", token, cookieOptions);

//     res.status(statusCode).json({
//       success: true,
//       message: "Otp verify Successfully.",
//       token,
//       data: {
//         user,
//       },
//       isRegistered: verify.isRegistered,
//     });
//   }
// };

// module.exports = createToken;

const jwt = require("jsonwebtoken");

const createToken = (user, statusCode, res, userType = false, employee = null) => {
  // Account type and permission role are separate:
  // - userType identifies which collection contains the account
  // - role identifies the permissions assigned to that account
  const accountType =
    typeof userType === "string"
      ? userType
      : (user.accountType || "");
  const permissionRole = user.role?.roleName || user.role || accountType;

  const payload = {
    id: user._id,
    userType: accountType,
    accountType,
    role: permissionRole,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d", // optional expiry
  });

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
  };

  if (!userType) {
    res.cookie("xcvbexamstons", token, cookieOptions);

    res.status(statusCode).json({
      success: true,
      token,
      data: {
        user,
        employee,
      },
    });
  }

  if (userType) {
    res.cookie("sfvbexamstons", token, cookieOptions);

    res.status(statusCode).json({
      success: true,
      message: "Otp verify Successfully.",
      token,
      data: {
        user,
        employee,
      },
    });
  }
};

module.exports = createToken;
