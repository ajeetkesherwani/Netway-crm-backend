const NewsLetter = require("../../../models_old/newsLetter");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getNewsLetterById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new AppError("id is required", 400));

  const newsLet = await NewsLetter.findById(id);
  if (!newsLet) return next(new AppError("NewsLetter Not found", 404));

  res.status(200).json({
    status: true,
    message: "Data retrive successfully!",
    data: newsLet,
  });
});
