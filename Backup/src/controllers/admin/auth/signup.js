const Admin = require("../../../models_old/admin");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.signup = catchAsync(async (req, res) => {
  let { name, email, phoneNo, password, address, bio, role } = req.body;
  if (!name) return next(new AppError("name is required", 404));

  const admin = new Admin({
    name,
    email,
    phoneNo,
    password,
    address,
    bio,
    role,
  });
  await admin.save();

  return res.status(201).json({
    status: true,
    message: "Account Created",
    data: { admin },
  });
});
