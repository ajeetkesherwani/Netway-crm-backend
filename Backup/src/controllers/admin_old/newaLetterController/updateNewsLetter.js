const NewsLetter = require("../../../models_old/newsLetter");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateNewsLetter = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  console.log("id", id);
  if (!id) return next(new AppError("id is required", 400));

  const { vendor_Id, product_Id, title, time_duration, description } = req.body;

  const newsLet = await NewsLetter.findById(id);
  if (!newsLet) return next(new AppError("NewsLetter Not found", 404));

  newsLet.vendor_Id = vendor_Id || newsLet.vendor_Id;
  newsLet.product_Id = product_Id || newsLet.product_Id;
  newsLet.title = title || newsLet.title;
  newsLet.time_duration = time_duration || newsLet.time_duration;
  newsLet.description = description || newsLet.description;

  await newsLet.save();

  res.status(200).json({
    status: true,
    message: "newsLetter update successfully",
    data: newsLet,
  });
});
