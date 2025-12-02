const Service = require("../../../models_old/service");
const AppError = require("../../../utils/AppError");

exports.getDataById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return new AppError("id is required", 400);

    const serviceInDetails = await Service.findById(id);
    if (!serviceInDetails) {
      return new AppError("service not found", 400);
    }

    res.status(200).json({
      success: true,
      message: "Service data retrive successfully!",
      data: serviceInDetails,
    });
  } catch (error) {
    return new AppError(error.message, 500);
  }
};
