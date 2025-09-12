const NewsLetter = require("../../../models_old/newsLetter");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteNewsLetter = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedNewsLetter = await NewsLetter.findByIdAndDelete(id);
    if (!deletedNewsLetter) return next(new AppError("newsLetter Not found", 404));

    res.status(200).json({ status: true, message: "newsLetter deleted successfully", data: deletedNewsLetter });

});