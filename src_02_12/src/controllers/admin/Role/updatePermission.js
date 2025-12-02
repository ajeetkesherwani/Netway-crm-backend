const Role = require("../../../models/role");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateRolePermissions = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new AppError("id is required", 404));

  const { permissions } = req.body;
  if (!permissions || typeof permissions !== "object")
    return next(new AppError("Permissions data is required", 400));

  const role = await Role.findById(id);
  if (!role) return next(new AppError("Role not found", 404));

  const setObj = {};
  const unsetObj = {};

  const currentPermissions = role.permissions?.toObject() || {};

  function buildUpdate(path, current, incoming) {
    const incomingKeys = Object.keys(incoming || {});
    const currentKeys = Object.keys(current || {});

    // Add or update keys
    incomingKeys.forEach((key) => {
      const fullPath = path ? `${path}.${key}` : key;
      const incomingVal = incoming[key];
      const currentVal = current ? current[key] : undefined;

      if (
        typeof incomingVal === "object" &&
        incomingVal !== null &&
        !Array.isArray(incomingVal)
      ) {
        if (typeof currentVal !== "object" || currentVal === null) {
          setObj[`permissions.${fullPath}`] = incomingVal;
        } else {
          buildUpdate(fullPath, currentVal, incomingVal);
        }
      } else {
        setObj[`permissions.${fullPath}`] = incomingVal;
      }
    });

    // Remove missing keys
    currentKeys.forEach((key) => {
      if (!incomingKeys.includes(key)) {
        const fullPath = path ? `${path}.${key}` : key;
        unsetObj[`permissions.${fullPath}`] = "";
      }
    });
  }

  buildUpdate("", currentPermissions, permissions);

  const updateObj = {};
  if (Object.keys(setObj).length) updateObj.$set = setObj;
  if (Object.keys(unsetObj).length) updateObj.$unset = unsetObj;

  let updatedRole = await Role.findByIdAndUpdate(id, updateObj, {
    new: true,
    runValidators: true,
  });

  // ✅ Clean empty objects
  function cleanEmpty(obj) {
    Object.keys(obj).forEach((key) => {
      if (obj[key] && typeof obj[key] === "object") {
        cleanEmpty(obj[key]);
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        }
      }
    });
  }

  const cleanPermissions = updatedRole.permissions.toObject();
  cleanEmpty(cleanPermissions);

  // Save cleaned version if necessary
  updatedRole.permissions = cleanPermissions;
  await updatedRole.save();

  return successResponse(res, "Role permissions updated successfully", updatedRole);

});
