const Vendor = require("../../../models_old/vendor");
const AppError = require("../../../utils/AppError");

exports.getDataById = async (req, res) => {
  const id = req.params.id;
  try {
    const vendorData = await Vendor.findById(id);
    if (!vendorData) {
      return new AppError("Vendor not found", 400);
    }

    res.status(200).json({
      success: true,
      message: "Vendor found",
      data: vendorData,
    });
  } catch (error) {
    return new AppError(error.message, 500);
  }
};
