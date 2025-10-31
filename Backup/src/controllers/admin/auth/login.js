// // const bcrypt = require("bcrypt");
// // const Admin = require("../../../models/admin");
// // const Reseller = require("../../../models/retailer");
// // const Lco = require("../../../models/lco");
// // const Staff = require("../../../models/Staff");
// // const AppError = require("../../../utils/AppError");
// // const catchAsync = require("../../../utils/catchAsync");
// // const createToken = require("../../../utils/createToken");

// // exports.login = catchAsync(async (req, res, next) => {
// //   const { email, password } = req.body;

// //   if (!email || !password) {
// //     return next(new AppError("Email and password are required.", 400));
// //   }

// //   let user = await Admin.findOne({ email }).populate("role");
// //   let userType = "admin";

// //   if (!user) {
// //     user = await Reseller.findOne({ email }).populate("role");
// //     userType = "reseller";
// //   }

// //   if (!user) {
// //     user = await Lco.findOne({ email }).populate("role");
// //     userType = "lco";
// //   }

// //   if (!user) {
// //     user = await Staff.findOne({ email }).populate("role");
// //     userType = "staff";
// //   }

// //   if (!user) {
// //     return next(new AppError("Invalid email or password.", 401));
// //   }

// //   // Compare password
// //   const isMatch = await bcrypt.compare(password, user.password);
// //   if (!isMatch) {
// //     return next(new AppError("Invalid email or password.", 401));
// //   }

// //   // Generate token
// //   createToken(user, 200, res);

// // });



// const bcrypt = require("bcryptjs");
// const mongoose = require("mongoose");

// const Admin = require("../../../models/admin");
// const Reseller = require("../../../models/retailer");
// const Lco = require("../../../models/lco");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const createToken = require("../../../utils/createToken");
// const ResellerConfig = require("../../../models/resellerConfig");

// exports.login = catchAsync(async (req, res, next) => {
//   const { email, password, employeeUserName } = req.body;

//   if ((!email && !employeeUserName) || !password) {
//     return next(new AppError("Email or employeeUserName and password are required.", 400));
//   }

//   let user = null;
//   let userType = "";
//   let employee = null;

//   // 1️⃣ Admin Login
//   if (email) {
//     user = await Admin.findOne({ email }).populate("role");
//     userType = "admin";

//     if (!user) return next(new AppError("Invalid email or password.", 401));

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return next(new AppError("Invalid email or password.", 401));

//     employee = {
//       type: "admin",
//       employeeName: user.title || "Admin",
//       _id: null,
//       employeeUserName: email,
//       email: email,
//       status: "active",
//     };
//   }

//   // 2️⃣ Reseller Employee Login
//   if (!user && employeeUserName) {
//     const reseller = await Reseller.findOne({
//       "employeeAssociation.employeeUserName": employeeUserName,
//     }).populate({
//       path: "role",
//       populate: { path: "permissions" },
//     });

//     if (reseller) {
//       employee = reseller.employeeAssociation.find(
//         (emp) => emp.employeeUserName === employeeUserName
//       );
//       if (!employee) return next(new AppError("Invalid employee username or password.", 401));

//       const isMatch = await bcrypt.compare(password, employee.password);
//       if (!isMatch) return next(new AppError("Invalid employee username or password.", 401));

//       user = reseller;
//       userType = "reseller";
//     }
//   }

//   // 3️⃣ LCO Employee Login
//   if (!user && employeeUserName) {
//     const lco = await Lco.findOne({
//       "employeeAssociation.employeeUserName": employeeUserName,
//     }).populate("role");

//     if (lco) {
//       employee = lco.employeeAssociation.find(
//         (emp) => emp.employeeUserName === employeeUserName
//       );
//       if (!employee) return next(new AppError("Invalid employee username or password.", 401));

//       const isMatch = await bcrypt.compare(password, employee.password);
//       if (!isMatch) return next(new AppError("Invalid employee username or password.", 401));

//       user = lco;
//       userType = "lco";
//     }
//   }

//   if (!user) return next(new AppError("Invalid email or username or password.", 401));

//   // 🔹 Fetch Config by typeId ONLY
//   let typeId;
//   try {
//     typeId = new mongoose.Types.ObjectId(user._id);
//   } catch (err) {
//     return next(new AppError("Invalid user ID", 400));
//   }

//   const resellerConfig = await ResellerConfig.findOne({ typeId }).lean();

//   let selectedConfig = null;

//   if (resellerConfig && employee && employee.type) {
//     const employeeTypeKey = employee.type.toLowerCase(); // admin / manager / operator

//     selectedConfig = {
//       _id: resellerConfig._id,
//       typeId: resellerConfig.typeId,
//       createdBy: resellerConfig.createdBy,
//       createdById: resellerConfig.createdById,
//       createdAt: resellerConfig.createdAt,
//       updatedAt: resellerConfig.updatedAt,
//     };

//     selectedConfig[employeeTypeKey] = resellerConfig[employeeTypeKey] || {};
//   }

//   const cleanUser = {
//     _id: user._id,
//     resellerName: user.resellerName || user.title || "",
//     email: user.email,
//     phoneNo: user.phoneNo || user.mobileNo,
//     role: user.role,
//     employee: {
//       _id: employee._id || null,
//       employeeName: employee.employeeName || "",
//       employeeUserName: employee.employeeUserName || "",
//       email: employee.email || "",
//       mobile: employee.mobile || "",
//       type: employee.type || "",
//       status: employee.status || "",
//     },
//     resellerConfig: selectedConfig,
//   };

//   createToken(cleanUser, 200, res, userType, employee);
// });

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Admin = require("../../../models/admin");
const Reseller = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const createToken = require("../../../utils/createToken");
const ResellerConfig = require("../../../models/resellerConfig");

exports.login = catchAsync(async (req, res, next) => {
  const { email, password, employeeUserName } = req.body;

  if ((!email && !employeeUserName) || !password) {
    return next(new AppError("Email or employeeUserName and password are required.", 400));
  }

  let user = null;
  let userType = "";
  let employee = null;

  // 1️⃣ ADMIN LOGIN
  if (email) {
    user = await Admin.findOne({ email }).populate("role");
    if (!user) return next(new AppError("Invalid email or password.", 401));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new AppError("Invalid email or password.", 401));

    userType = "admin";
    employee = {
      type: "Admin",
      employeeName: user.title || "Administrator",
      _id: null,
      employeeUserName: email,
      email: email,
      mobile: user.mobile || null,
      status: "active",
    };
  }

  // 2️⃣ RESELLER EMPLOYEE LOGIN
  if (!user && employeeUserName) {
    const reseller = await Reseller.findOne({
      "employeeAssociation.employeeUserName": employeeUserName,
    })
      .populate({
        path: "role",
        select: "roleName permissions",
      })
      .lean();

    if (reseller) {
      const foundEmployee = reseller.employeeAssociation.find(
        (emp) => emp.employeeUserName === employeeUserName
      );
      if (!foundEmployee)
        return next(new AppError("Invalid employee username or password.", 401));

      const isMatch = await bcrypt.compare(password, foundEmployee.password);
      if (!isMatch)
        return next(new AppError("Invalid employee username or password.", 401));

      user = reseller;
      employee = foundEmployee;
      userType = "reseller";
    }
  }

  // 3️⃣ LCO EMPLOYEE LOGIN
  if (!user && employeeUserName) {
    const lco = await Lco.findOne({
      "employeeAssociation.employeeUserName": employeeUserName,
    })
      .populate({
        path: "role",
        select: "roleName permissions",
      })
      .populate({
        path: "retailerId", // LCO’s parent reseller
        select: "resellerName",
        populate: {
          path: "role",
          select: "roleName",
        },
      })
      .lean();

    if (lco) {
      const foundEmployee = lco.employeeAssociation.find(
        (emp) => emp.employeeUserName === employeeUserName
      );
      if (!foundEmployee)
        return next(new AppError("Invalid employee username or password.", 401));

      const isMatch = await bcrypt.compare(password, foundEmployee.password);
      if (!isMatch)
        return next(new AppError("Invalid employee username or password.", 401));

      user = lco;
      employee = foundEmployee;
      userType = "lco";
    }
  }

  if (!user) return next(new AppError("Invalid credentials.", 401));

  // 4️⃣ FETCH CONFIGURATION (only for reseller or LCO)
  let resellerConfig = null;
  if (userType === "reseller" || userType === "lco") {
    const typeId = new mongoose.Types.ObjectId(user._id);
    const config = await ResellerConfig.findOne({ typeId }).lean();

    if (config && employee?.type) {
      const key = employee.type.toLowerCase();
      resellerConfig = {
        _id: config._id,
        typeId: config.typeId,
        createdBy: config.createdBy,
        createdById: config.createdById,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
        [key]: config[key] || {},
      };
    }
  }

  // 5️⃣ BUILD RESPONSE BASED ON USER TYPE
  let cleanUser = {};

  if (userType === "admin") {
    cleanUser = {
      _id: user._id,
      adminName: user.title || "Admin",
      email: user.email,
      mobile: user.mobile,
      role: {
        roleName: user.role?.roleName || "ADMIN",
        permissions: user.role?.permissions || {},
      },
      employee,
    };
  } else if (userType === "reseller") {
    cleanUser = {
      _id: user._id,
      resellerName: user.resellerName,
      email: user.email,
      phoneNo: user.phoneNo,
      role: {
        roleName: user.role?.roleName || "RESELLER",
        permissions: user.role?.permissions || {},
      },
      employee,
      resellerConfig,
    };
  } else if (userType === "lco") {
    cleanUser = {
      _id: user._id,
      lcoName: user.lcoName,
      email: user.email,
      phoneNo: user.phoneNo,
      role: {
        roleName: user.role?.roleName || "LCO",
        permissions: user.role?.permissions || {},
      },
      employee,
      resellerConfig,
      parentReseller: user.retailerId
        ? {
          _id: user.retailerId._id,
          resellerName: user.retailerId.resellerName,
          email: user.retailerId.email,
          phoneNo: user.retailerId.phoneNo,
          roleName: user.retailerId.role?.roleName || "Reseller",
        }
        : null,
    };
  }

  // 6️⃣ CREATE TOKEN
  createToken(cleanUser, 200, res, userType, employee);
});
