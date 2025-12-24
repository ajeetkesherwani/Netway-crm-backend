const Staff = require("../../../models/Staff");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");


//generate random username
const generateUserName = (name) => {
  const cleanName = name.replace(/\s+/g, '').toLowerCase(); // remove spaces & lowercase
  const randomDigits = Math.floor(10 + Math.random() * 90); // 2 digits
  const randomLetters = Math.random().toString(36).substring(2, 4); // 2 random letters
  return `${cleanName}@${randomDigits}${randomLetters}`;
};

exports.createStaff = catchAsync(async (req, res, next) => {

  const { name, email, phoneNo, password, address, bio,
    role, logId, staffName, salary, comment, area, staffIp, status } = req.body;

    console.log("Creating staff with data:", req.body);
  if (!name) return next(new AppError("name is required", 400));
  if (!email) return next(new AppError("email is required", 400));
  if (!phoneNo) return next(new AppError("phoneNo is required", 400));
  if (!password) return next(new AppError("password is required", 400));
  if (!role) return next(new AppError("roleId is required", 400));
  // if (!staffName) return next(new AppError("staffName is required", 400));

  const userName = generateUserName(name);

  const existingUser = await Staff.findOne({ userName });
  if (existingUser) {
    return next(new AppError("staff already exist", 404));
  }

  // Create staff
  const staff = await Staff.create({
    name, userName, email, phoneNo, password, plainPassword: password, address, bio, role, logId, staffName,
    salary, comment, area, staffIp, status
  });

  successResponse(res, "Staff created successfully", staff);

});
