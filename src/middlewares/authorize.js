// middleware/authorize.js
const AppError = require("../utils/AppError");
const Role = require("../models/role");
const Reseller = require("../models/retailer");
const ResellerConfig = require("../models/resellerConfig");
const Lco = require("../models/lco"); // Assuming you have similar logic for LCO
// const LcoConfig = require("../models/lcoConfig"); // Create this if it doesn't exist

/**
 * @param {string} moduleName - e.g., 'users'
 * @param {string} action - e.g., 'create'
 */
exports.authorize = (moduleName, action) => {
  return async (req, res, next) => {
    const user = req.user;

    if (!user || !user.role) {
      return next(new AppError("Unauthorized access", 401));
    }

    try {
      let permissions = null;

      // ============================
      // ✅ 1. Reseller Permissions
      // ============================
      if (user.role === "Reseller") {
        const reseller = await Reseller.findById(user._id);
        if (!reseller) return next(new AppError("Reseller not found", 404));

        const resellerConfig = await ResellerConfig.findOne({ typeId: reseller._id });
        if (!resellerConfig) return next(new AppError("Reseller config not found", 500));

        let employeeRole = "admin";

        // Check if it's a nested employee user
        const employee = reseller.employeeAssociation?.find(emp =>
          emp.employeeUserName === user.username && emp.status === "active"
        );

        if (employee) {
          employeeRole = employee.type?.toLowerCase(); // e.g., 'manager'
        }

        const rolePermissions = resellerConfig[employeeRole];
        if (!rolePermissions || !Array.isArray(rolePermissions)) {
          return next(new AppError("Permissions not defined for this employee role", 403));
        }

        // Find permission for module/action
        const allowed = rolePermissions.find(
          (perm) => perm.module === moduleName && perm[action] === true
        );

        if (!allowed) {
          return next(new AppError(`Access denied to ${action} on ${moduleName}`, 403));
        }

        return next(); // ✅ Allowed
      }

      // ============================
      // ✅ 2. LCO Permissions
      // ============================
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
        if (!rolePermissions || !Array.isArray(rolePermissions)) {
          return next(new AppError("Permissions not defined for this employee role", 403));
        }

        const allowed = rolePermissions.find(
          (perm) => perm.module === moduleName && perm[action] === true
        );

        if (!allowed) {
          return next(new AppError(`Access denied to ${action} on ${moduleName}`, 403));
        }

        return next(); // ✅ Allowed
      }

      // ============================
      // ✅ 3. Other Roles (Admin, etc.)
      // ============================
      const roleDoc = await Role.findOne({ roleName: user.role });
      if (!roleDoc) {
        return next(new AppError("Role not found", 403));
      }

      const globalPermissions = roleDoc.permissions?.get(moduleName);
      if (!globalPermissions || globalPermissions[action] !== true) {
        return next(new AppError(`Access denied to ${action} on ${moduleName}`, 403));
      }

      next(); // ✅ Allowed
    } catch (error) {
      console.error("Authorization error:", error);
      return next(new AppError("Error checking permissions", 500));
    }
  };
};
// ============================
// ✅ 4. Default Deny
// ============================