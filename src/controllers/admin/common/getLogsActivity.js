const Logs = require("../../../models/activity");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getLogsByRoleAndId = catchAsync(async (req, res, next) => {
  const { role, id } = req.params;

  if (!role || !id) {
    return next(new AppError("Role and ID are required", 400));
  }

  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  const validRoles = ["Admin", "Staff", "Reseller", "Lco", "User"];
  if (!validRoles.includes(formattedRole)) {
    return next(new AppError("Invalid role provided", 400));
  }

  // Fetch logs and populate the correct fields dynamically
  const logs = await Logs.find({
    createdByRole: formattedRole,
    createdById: id
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "createdById",
      select: "staffName resellerName lcoName adminName generalInformation.name generalInformation.username"
    })
    .lean(); // faster for read-only operations

  successResponse(res, "Logs fetched successfully", {
    total: logs.length,
    data: logs
  });
});
