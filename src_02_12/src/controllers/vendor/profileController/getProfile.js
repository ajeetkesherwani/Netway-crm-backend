const Vendor = require("../../../models/vendor");
const catchAsync = require("../../../utils/catchAsync");

exports.getProfile = catchAsync(async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    console.log(vendorId);
    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    return res.status(200).json({
      success: true,
      user: vendor,
    });
  } catch (error) {
    console.error("Error in getProfile controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
