const Category = require("../../../models_old/category");
const catchAsync = require("../../../utils/catchAsync");

exports.getSubCategory = catchAsync(async (req, res) => {
  const cat_id = req.params.id;
  const subCategories = await Category.find({
    cat_id: cat_id,
    status: "active",
  })
    .select("name cat_id serviceId")
    .populate({
      path: "serviceId",
      select: "name",
    });

  return res.status(200).json({
    status: true,
    results: subCategories.length,
    data: subCategories,
  });
});
