const UserAddress = require("../../../models/userAddresses");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteAddress = catchAsync(async (req, res) => {
  const id = req.params.id;

  if (!id || !id.trim()) {
    return new AppError(`Id is required.`, 400);
  }

  const deleteAddress = await UserAddress.findByIdAndDelete(id);
  if (!deleteAddress) {
    return new AppError(`Address not found.`, 400);
  }

  return res.status(200).json({
    status: true,
    message: "Address Deleted successfully",
  });
});
