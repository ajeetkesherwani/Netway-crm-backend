const Banners = require("../../../models/banners");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getOneBanner = catchAsync(async(req, res, next) => {

    const { id } = req.params;
    if(!id) return next(new AppError("id is required", 400));

    const bannerDetails = await Banners.findById(id);
    if(!bannerDetails) return next(new AppError("banner not found", 404));

    res.status(200).json({ status: true, message: "Banner in Details",data: bannerDetails});

});