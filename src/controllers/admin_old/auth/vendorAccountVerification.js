const Vendor = require("../../../models_old/vendor");
const catchAsync = require("../../../utils/catchAsync");

exports.vendorAccountVerification = catchAsync(async (req, res) => {
  const { vendorId, status } = req.body;

  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: "Vendor not found!",
    });
  }

  vendor.status = status;
  await vendor.save();

  res.status(200).json({
    success: true,
    message: "Vendor account verification status updated successfully",
    data: vendor,
  });
});
