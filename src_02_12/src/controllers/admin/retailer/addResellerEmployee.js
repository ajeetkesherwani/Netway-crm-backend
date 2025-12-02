const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const bcrypt = require("bcryptjs");

exports.addResellerEmployee = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { employee } = req.body;

  //  1. Role check
  // if (!req.user || !["admin", "reseller"].includes(req.user.role)) {
  //   return next(new AppError("You are not authorized to add employees", 403));
  // }

  if (!employee || typeof employee !== "object") {
    return next(new AppError("Employee object is required", 400));
  }

  const requiredFields = ["employeeUserName", "password"];
  for (let field of requiredFields) {
    if (!employee[field]) {
      return next(new AppError(`Field '${field}' is required in employee object`, 400));
    }
  }

  // Find retailer by ID
  const retailer = await Retailer.findById(id);
  if (!retailer) return next(new AppError("Retailer not found", 404));

  // Check for duplicate employee username
  const existingEmp = retailer.employeeAssociation.find(
    (emp) => emp.employeeUserName === employee.employeeUserName
  );
  if (existingEmp) return next(new AppError("Employee username already exists", 400));

  // Hash the password
  // employee.password = employee.password

  // Push new employee to employeeAssociation array
  retailer.employeeAssociation.push(employee);

  await retailer.save();

  return successResponse(res, "Employee added successfully", retailer.employeeAssociation);
});
