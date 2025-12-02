const Service = require("../../../models/service");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllServices = catchAsync(async (req, res, next) => {
  try {
    const { type } = req.query;

    const services = await Service.find({ status: "active" }).select(
      "name image"
    );

    if (!services || services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No services found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Services retrieved successfully",
      data: services,
    });
  } catch (error) {
    console.error("Error in get services controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
