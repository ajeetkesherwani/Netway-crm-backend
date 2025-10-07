// const bcrypt = require("bcrypt");
// const Admin = require("../../../models/admin");
// const Reseller = require("../../../models/retailer");
// const Lco = require("../../../models/lco");
// const Staff = require("../../../models/Staff");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const createToken = require("../../../utils/createToken");

// exports.login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return next(new AppError("Email and password are required.", 400));
//   }

//   let user = await Admin.findOne({ email }).populate("role");
//   let userType = "admin";

//   if (!user) {
//     user = await Reseller.findOne({ email }).populate("role");
//     userType = "reseller";
//   }

//   if (!user) {
//     user = await Lco.findOne({ email }).populate("role");
//     userType = "lco";
//   }

//   if (!user) {
//     user = await Staff.findOne({ email }).populate("role");
//     userType = "staff";
//   }

//   if (!user) {
//     return next(new AppError("Invalid email or password.", 401));
//   }

//   // Compare password
//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     return next(new AppError("Invalid email or password.", 401));
//   }

//   // Generate token
//   createToken(user, 200, res);

// });

const bcrypt = require("bcryptjs");
const Admin = require("../../../models/admin");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const createToken = require("../../../utils/createToken");
const ResellerConfig = require("../../../models/resellerConfig");

exports.login = catchAsync(async (req, res, next) => {
  // console.log(await bcrypt.hash("123456", 10))
  const { email, password, employeeUserName } = req.body;
  console.log("req.body", req.body);
  // ✅ Validation
  if ((!email && !employeeUserName) || !password) {
    return next(new AppError("Email or employeeUserName and password are required.", 400));
  }

  let user = null;
  let userType = "";

  // ✅ 1. Admin Login
  if (email) {
    user = await Admin.findOne({ email }).populate("role");
    userType = "admin";
  }

  //2.reseller login
  if (!user && employeeUserName) {
    const reseller = await Reseller.findOne({
      "employeeAssociation.employeeUserName": employeeUserName,
    })
      .populate("role")
      .lean();

    if (!reseller) {
      return next(new AppError("Invalid employee username or password.", 401));
    }

    // Find the logged-in employee only
    const employee = reseller.employeeAssociation.find(
      (emp) => emp.employeeUserName === employeeUserName
    );

    if (!employee) {
      return next(new AppError("Invalid employee username or password.", 401));
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return next(new AppError("Invalid employee username or password.", 401));
    }

    user = reseller;
    userType = "reseller";

    // Fetch reseller config for this employee type only
    let resellerConfig = await ResellerConfig.findOne({
      typeId: reseller._id,
      type: employee.type,
    }).lean();

    if (resellerConfig) {
      const filteredConfig = {
        _id: resellerConfig._id,
        type: resellerConfig.type,
        typeId: resellerConfig.typeId,
        createdBy: resellerConfig.createdBy,
        createdById: resellerConfig.createdById,
        createdAt: resellerConfig.createdAt,
        updatedAt: resellerConfig.updatedAt,
        __v: resellerConfig.__v,
      };

      const employeeTypeKey = employee.type.toLowerCase();
      if (resellerConfig[employeeTypeKey]) {
        filteredConfig[employeeTypeKey] = resellerConfig[employeeTypeKey];
      }

      resellerConfig = filteredConfig;
    }

    user.resellerConfig = resellerConfig || null;

    // Attach only the logged-in employee
    user.employee = employee;

    // Remove all employeeAssociation except the logged-in one
    delete user.employeeAssociation;
  }


  // ✅ 3. LCO Login
  // if (!user && email) {
  //   user = await Lco.findOne({ email }).populate("role");
  //   userType = "lco";
  // }

  if (!user && employeeUserName) {
    const lco = await Lco.findOne({
      "employeeAssociation.employeeUserName": employeeUserName,
    })
      .populate("roleId")
      .lean();

    if (!lco) {
      return next(new AppError("Invalid employee username or password.", 401));
    }

    // Find the logged-in employee only
    const employee = lco.employeeAssociation.find(
      (emp) => emp.employeeUserName === employeeUserName
    );

    if (!employee) {
      return next(new AppError("Invalid employee username or password.", 401));
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return next(new AppError("Invalid employee username or password.", 401));
    }

    user = lco;
    userType = "lco";

    // Fetch reseller config for this employee type only
    let lcoConfig = await LcoConfig.findOne({
      typeId: lco._id,
      type: employee.type,
    }).lean();

    if (lcoConfig) {
      const filteredConfig = {
        _id: lcoConfig._id,
        type: lcoConfig.type,
        typeId: lcoConfig.typeId,
        createdBy: lcoConfig.createdBy,
        createdById: lcoConfig.createdById,
        createdAt: lcoConfig.createdAt,
        updatedAt: lcoConfig.updatedAt,
      };

      const employeeTypeKey = employee.type.toLowerCase();
      if (lcoConfig[employeeTypeKey]) {
        filteredConfig[employeeTypeKey] = lcoConfig[employeeTypeKey];
      }

      lcoConfig = filteredConfig;
    }

    user.lcoConfig = lcoConfig || null;

    // Attach only the logged-in employee
    user.employee = employee;

    // Remove all employeeAssociation except the logged-in one
    delete user.employeeAssociation;
  }


  // ✅ 4. Staff Login
  if (!user && email) {
    user = await Staff.findOne({ email }).populate("role");
    userType = "staff";
  }

  // ✅ 5. If user not found
  if (!user) {
    return next(new AppError("Invalid email or password.", 401));
  }

  // ✅ Compare password for Admin, Lco, Staff
  if (userType !== "reseller") {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError("Invalid email or password.", 401));
    }
  }

  // ✅ Generate Token
  createToken(user, 200, res, userType, user.employee || null);
});
