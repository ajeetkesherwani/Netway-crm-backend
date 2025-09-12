const DealsOfTheDay = require("../../../models_old/dealsOfTheDay");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteDealsOfTheDay = catchAsync(async (req, res) => {
  let id = req.params.id;

  if (!id || !id.trim()) {
    return new AppError(`Id is required.`, 400);
  }

  const deletedDetals = await DealsOfTheDay.findById(id);
  if (!deletedDetals) return new AppError(`IDelas not found.`, 400);

  await DealsOfTheDay.findByIdAndDelete(id);
  message = "Deals Deleted successfully";

  return res.status(200).json({
    status: true,
    message: message,
  });
});
