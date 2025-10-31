const Staff = require("../../../models/Staff");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.createStaff = catchAsync(async (req, res, next) => {

  const { name, email, phoneNo, password, address, bio,
    role, logId, staffName, salary, comment, area, staffIp, status } = req.body;

  if (!name) return next(new AppError("name is required", 400));
  if (!email) return next(new AppError("email is required", 400));
  if (!phoneNo) return next(new AppError("phoneNo is required", 400));
  if (!password) return next(new AppError("password is required", 400));
  if (!role) return next(new AppError("roleId is required", 400));
  if (!staffName) return next(new AppError("staffName is required", 400));

  // Create staff
  const staff = await Staff.create({
    name, email, phoneNo, password, address, bio, role, logId, staffName,
    salary, comment, area, staffIp, status
  });

  successResponse(res, "Staff created successfully", staff)

});
