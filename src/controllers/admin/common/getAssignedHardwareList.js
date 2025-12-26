const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

/* ───────────── GET USER ASSIGNED HARDWARE ───────────── */
exports.getUserAssignedHardware = catchAsync(async (req, res, next) => {
    
  const { userId } = req.params;

  if (!userId) {
    return next(new AppError("userId is required", 400));
  }

  const user = await User.findById(userId)
    .select("generalInformation.name generalInformation.phone generalInformation.username generalInformation.email assignedHardware")
    .populate({
      path: "assignedHardware",
      select: "hardwareName hardwareType brand model serialNumber price purchaseDate warrantyExpiry ",
    })
    .lean();

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  successResponse(res, "User assigned hardware fetched successfully", {
    user: {
      id: user._id,
      name: user.generalInformation?.name,
      phone: user.generalInformation?.phone,
      userName: user.generalInformation?.username,
      email: user.generalInformation?.email,
    },
    totalCount: user.assignedHardware?.length || 0,
    hardware: user.assignedHardware || [],
  });
});
