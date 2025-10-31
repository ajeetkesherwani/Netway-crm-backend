const Banners = require("../../../models/banners");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createBanner = catchAsync(async(req, res, next) => {

    const { service_Id, vendor_Id, type, redirect_url, status } = req.body;
    console.log("Hello");
    
    const imagePath = req.files?.image?.[0].path; 

  if (!imagePath) {
    return next(new AppError("Image is required", 400));
  }

    if(!service_Id) return next(new AppError("service_Id is required", 400));
    if(!vendor_Id) return next(new AppError("vendor_Id is required", 400));
    if(!redirect_url) return next(new AppError("redirect_url is required", 400));

    const newBanner = new Banners({ service_Id, vendor_Id, image: imagePath, type, redirect_url, status });

    await newBanner.save();

    res.status(200).json({ status: true, message: "new Banner created", data: newBanner });

});