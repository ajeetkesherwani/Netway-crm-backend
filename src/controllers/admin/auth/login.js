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
const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const createToken = require("../../../utils/createToken");
const ResellerConfig = require("../../../models/resellerConfig");

exports.login = catchAsync(async (req, res, next) => {
  const { email, password, employeeUserName, userName } = req.body;
  console.log("req.body", req.body);

  if ((!email && !employeeUserName && !userName) || !password) {
    return next(new AppError("Email or employeeUserName and password are required.", 400));
  }

  let user = null;
  let userType = "";
  let employee = null;

  // 1️⃣ ADMIN LOGIN
  if (email) {
    user = await Admin.findOne({ email }).populate("role");

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return next(new AppError("Invalid email or password.", 401));

      userType = "admin";
      employee = {
        type: "Admin",
        employeeName: user.title || "Administrator",
        _id: user._id,
        employeeUserName: email,
        email: email,
        phoneNo: user.phoneNo || null,
        status: "active",
      };
    }
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

  // 4️⃣ STAFF LOGIN
  if (!user && (userName || email)) {
    const searchValue = userName || email;
    const staff = await Staff.findOne({
      $or: [{ logId: searchValue }, { userName: searchValue }, { email: searchValue }]
    })
      .populate({
        path: "role",
        select: "roleName permissions",
      })
      .lean();

    if (!staff) return next(new AppError("Invalid username or password.", 401));

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return next(new AppError("Invalid username or password.", 401));

    user = staff;
    userType = "staff";

    employee = {
      _id: staff._id,
      type: "Staff",
      employeeName: staff.staffName || staff.name,
      employeeUserName: staff.userName,
      email: staff.email,
      mobile: staff.phoneNo,
      status: staff.status,
    };
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
  } else if (userType === "staff") {
    cleanUser = {
      _id: user._id,
      staffName: user.staffName || user.name,
      email: user.email,
      phoneNo: user.phoneNo,
      area: user.area,
      salary: user.salary,
      comment: user.comment,
      status: user.status,
      address: user.address,
      bio: user.bio,
      role: {
        roleName: user.role?.roleName || "STAFF",
        permissions: user.role?.permissions || {},
      },
      employee,
    };
  }

  // 6️⃣ GENERATE AND SEND OTP
  const LoginOtp = require("../../../models/loginOtp");
  const { sendWhatsappNotification } = require("../../../services/whatsappService");

  // Determine mobile number
  let mobile = "";
  if (cleanUser.employee && cleanUser.employee.mobile) {
    mobile = cleanUser.employee.mobile;
  } else if (cleanUser.employee && cleanUser.employee.phoneNo) {
    mobile = cleanUser.employee.phoneNo;
  } else if (cleanUser.phoneNo) {
    mobile = cleanUser.phoneNo;
  } else if (cleanUser.mobile) {
    mobile = cleanUser.mobile;
  }

  const mobileStr = mobile ? String(mobile) : "";

  if (!mobileStr || mobileStr === "N/A" || mobileStr.trim() === "") {
    // If the user literally has no mobile number saved, we fallback to standard login
    console.log("[Login] No mobile number found. Proceeding without OTP.");
    return createToken(cleanUser, 200, res, userType, employee);
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  const newOtp = await LoginOtp.create({
    otp: otpCode,
    mobileSentTo: mobile,
    cleanUser,
    userType,
    employee,
  });

  try {
    // Send OTP to WhatsApp in body_params as required by QuickMessage template
    await sendWhatsappNotification(String(mobile), "otp_login1", [otpCode], [], []);
    console.log(`[Login] OTP sent to ${mobile}`);
  } catch (error) {
    console.error("[Login] Failed to send OTP to WhatsApp:", error.message);
  }

  return res.status(200).json({
    status: "success",
    message: "OTP sent to registered mobile number.",
    requireOtp: true,
    loginSessionId: newOtp._id,
    mobileSentTo: mobile // Sending the full number as requested!
  });
});
