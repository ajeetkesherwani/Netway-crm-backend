const Vendor = require("../../../models_old/vendor");
const catchAsync = require("../../../utils/catchAsync");

exports.vendorAccountVerification = catchAsync(async (req, res) => {
  const { vendorId, status } = req.body;

  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: "Vendor not found!",
    });
  }

  vendor.status = status;
  await vendor.save();

  res.status(200).json({
    success: true,
    message: "Vendor account verification status updated successfully",
    data: vendor,
  });
});



// // ✅ Login Reseller with EmployeeAssociation
// exports.loginEmployee = catchAsync(async (req, res, next) => {
//   const { employeeUserName, password } = req.body;
//   if (!employeeUserName || !password) return next(new AppError("Username and password required", 400));

//   // Find retailer who has this employee username
//   const retailer = await Retailer.findOne({ "employeeAssociation.employeeUserName": employeeUserName });
//   if (!retailer) return next(new AppError("Invalid username or password", 401));

//   const employee = retailer.employeeAssociation.find(emp => emp.employeeUserName === employeeUserName);
//   if (!employee) return next(new AppError("Employee not found", 404));

//   const isMatch = await retailer.compareEmployeePassword(password, employee.password);
//   if (!isMatch) return next(new AppError("Invalid username or password", 401));

//   successResponse(res, "Login successful", {
//     resellerName: retailer.resellerName,
//     employeeType: employee.type,
//     employeeName: employee.employeeName,
//   });
// });