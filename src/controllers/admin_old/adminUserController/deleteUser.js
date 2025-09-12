const Admin = require("../../../models_old/admin");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) throw new AppError("Admin not found", 404);

  successResponse(res, "Admin deleted successfully", { admin });
});
