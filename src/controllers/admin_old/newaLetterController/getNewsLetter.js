const NewsLetter = require("../../../models_old/newsLetter");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const paginate = require("../../../utils/paginate");

exports.getNewsLetter = catchAsync(async(req, res, next) => {

    // const newsLetters = await NewsLetter.find();

    const { page, limit } = req.query;

    const newsLetters = await paginate(NewsLetter, {}, {
        page,
        limit,
        sort: { createdAt: -1 }
    });

    if(!newsLetters || newsLetters.paginateData.length === 0){
        return next(new AppError("newsLetters not found", 404));
    }

    res.status(200).json({ 
        status: true, 
        message: "newsLetter found",
        count: newsLetters.paginateData.length, 
        data: newsLetters
     });
});