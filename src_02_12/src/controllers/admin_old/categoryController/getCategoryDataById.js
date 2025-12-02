const Category = require("../../../models_old/category");
const catchAsync = require("../../../utils/catchAsync");

exports.getCategoryDataById = catchAsync(async (req, res) => {
  const id = req.params.catId;
  const getDataById = await Category.findById(id);

  return res.status(200).json({
    status: true,
    data: getDataById,
  });
});
