// middlewares/checkPermission.js
const rolesConfig = require("../config/roles");
const AppError = require("../utils/AppError");

/**
 * Middleware to check module-level permission.
 * @param {string} moduleName - e.g., 'packages'
 * @param {string} action - e.g., 'edit'
 */
const checkPermission = (moduleName, action) => {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
      return next(new AppError("No role assigned to user", 403));
    }

    const rolePermissions = rolesConfig[role];
    if (!rolePermissions) {
      return next(new AppError("Role is not defined in permissions config", 403));
    }

    const modulePermissions = rolePermissions[moduleName];
    if (!modulePermissions || !modulePermissions.includes(action)) {
      return next(new AppError(`Permission denied for ${action} on ${moduleName}`, 403));
    }

    next();
  };
};

module.exports = checkPermission;
