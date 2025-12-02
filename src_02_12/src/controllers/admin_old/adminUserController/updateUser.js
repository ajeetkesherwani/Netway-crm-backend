const Admin = require("../../../models_old/admin");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  if (req.files && req.files.image) {
    const file = req.files.image[0];
    updateData.image = `${file.destination}/${file.filename}`;
  }

  const admin = await Admin.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!admin) throw new AppError("User not found", 404);

  successResponse(res, "Admin updated successfully", { admin });
});
