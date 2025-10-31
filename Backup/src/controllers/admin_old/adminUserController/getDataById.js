const Admin = require("../../../models_old/admin");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getDataById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findById(id).populate("role");
  if (!admin) throw new AppError("User not found", 404);

  successResponse(res, "Admin fetched successfully", { admin });
});
