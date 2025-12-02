const Banners = require("../../../models/banners");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const paginate = require("../../../utils/paginate");

exports.getBanner = catchAsync(async(req, res, next) => {

    const{ page, limit} = req.query;

    const banner = await paginate(Banners, {}, {
      page,
      limit,
      sort: { createdAt: -1 }
    });


    if(!banner) return next(new AppError("Banner not found found", 404));

    res.status(200).json({ status: true, message: "Banners found",count: banner.length, data: banner })

});