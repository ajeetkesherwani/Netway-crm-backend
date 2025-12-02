// middleware/authorize.js
const AppError = require("../utils/AppError");
const Role = require("../models/role");
const Reseller = require("../models/retailer");
const ResellerConfig = require("../models/resellerConfig");
const Lco = require("../models/lco");
// const LcoConfig = require("../models/lcoConfig"); // optional

exports.authorize = (moduleName, action) => {
  return async (req, res, next) => {
    const user = req.user;

    if (!user || !user.role) {
      return next(new AppError("Unauthorized access", 401));
    }

    try {
      // ========================================
      // ✅ 1. Reseller Permissions (Map-based)
      // ========================================
      if (user.role === "Reseller") {
        const reseller = await Reseller.findById(user._id);
        if (!reseller) return next(new AppError("Reseller not found", 404));

        const resellerConfig = await ResellerConfig.findOne({ typeId: reseller._id });
        if (!resellerConfig) return next(new AppError("Reseller config not found", 500));

        let employeeRole = "admin";

        // Check if user is a nested employee (by username)
        const employee = reseller.employeeAssociation?.find(emp =>
          emp.employeeUserName === user.username && emp.status === "active"
        );

        if (employee) {
          employeeRole = employee.type?.toLowerCase(); // manager / operator
        }

        // Get role-based permissions from reseller config
        const rolePermissions = resellerConfig[employeeRole]; // Map
        if (!rolePermissions || !(rolePermissions instanceof Map)) {
          return next(new AppError("Permissions not defined for this role", 403));
        }

        const modulePerms = rolePermissions.get(moduleName);
        if (!modulePerms || modulePerms[action] !== true) {
          return next(new AppError(`Access denied to ${action} on ${moduleName}`, 403));
        }

        return next(); // ✅ Allowed
      }

      // ========================================
      // ✅ 2. LCO Permissions (Same logic if used)
      // ========================================
      if (user.role === "Lco") {
        const lco = await Lco.findById(user._id);
        if (!lco) return next(new AppError("LCO not found", 404));

        const lcoConfig = await LcoConfig.findOne({ typeId: lco._id });
        if (!lcoConfig) return next(new AppError("LCO config not found", 500));

        let employeeRole = "admin";

        const employee = lco.employeeAssociation?.find(emp =>
          emp.employeeUserName === user.username && emp.status === "active"
        );

        if (employee) {
          employeeRole = employee.type?.toLowerCase();
        }

        const rolePermissions = lcoConfig[employeeRole];
        if (!rolePermissions || !(rolePermissions instanceof Map)) {
          return next(new AppError("Permissions not defined for this role", 403));
        }

        const modulePerms = rolePermissions.get(moduleName);
        if (!modulePerms || modulePerms[action] !== true) {
          return next(new AppError(`Access denied to ${action} on ${moduleName}`, 403));
        }

        return next(); // ✅ Allowed
      }

      // ========================================
      // ✅ 3. Admin / Other Role (Role Schema)
      // ========================================
      const roleDoc = await Role.findOne({ roleName: user.role });
      if (!roleDoc) {
        return next(new AppError("Role not found", 403));
      }

      const globalPermissions = roleDoc.permissions?.get(moduleName);
      if (!globalPermissions || globalPermissions[action] !== true) {
        return next(new AppError(`Access denied to ${action} on ${moduleName}`, 403));
      }

      return next(); // ✅ Allowed
    } catch (error) {
      console.error("Authorization error:", error);
      return next(new AppError("Error checking permissions", 500));
    }
  };
};
