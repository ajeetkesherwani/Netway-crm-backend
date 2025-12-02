const NewsLetter = require("../../../models_old/newsLetter");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createNewsLetter = catchAsync(async(req, res) => {

    const { vendor_Id, product_Id, title, time_duration, description } = req.body;

     if(!vendor_Id) return next(new AppError("vendor_Id is required", 400));
     if(!product_Id) return next(new AppError("product_Id is required", 400));
     if(!title) return next(new AppError("title is required", 400));
     if(!time_duration) return next(new AppError("time_duration is required", 400));
     if(!description) return next(new AppError("description is required", 400));

     const newNewLetter = new NewsLetter({ vendor_Id, product_Id, title, time_duration, description });

     await newNewLetter.save();

     res.status(200).json({ status: true, message: "newsLetter created successfully", count: newNewLetter, data: newNewLetter });

});