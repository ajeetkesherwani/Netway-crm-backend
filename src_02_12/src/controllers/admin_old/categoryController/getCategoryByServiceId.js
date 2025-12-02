const Category = require("../../../models_old/category");
const catchAsync = require("../../../utils/catchAsync");

exports.getCategoryByServiceId = catchAsync(async (req, res) => {
  const serviceId = req.params.serviceId;
  const allServiceCategory = await Category.find({
    serviceId: serviceId,
  }).populate({
    path: "serviceId",
    select: "name",
  });

  return res.status(200).json({
    status: true,
    results: allServiceCategory.length,
    data: allServiceCategory,
  });
});
