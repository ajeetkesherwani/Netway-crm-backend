const Banners = require("../../../models/banners");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateBanner = catchAsync(async (req, res, next) => {

    const { id } = req.params;
    if (!id) return next(new AppError("id is required", 400));

    const { service_Id, vendor_Id, type, redirect_url, status } = req.body;

    const updatedBanner = await Banners.findById(id);
    if (!updatedBanner) return next(new AppError(" Banner not found", 404));

    updatedBanner.service_Id = service_Id || updatedBanner.service_Id
    updatedBanner.vendor_Id = vendor_Id || updatedBanner.vendor_Id
    updatedBanner.type = type || updatedBanner.type
    updatedBanner.redirect_url = redirect_url || updatedBanner.redirect_url
    updatedBanner.status = status || updatedBanner.status


    const imagePath = req?.files?.image?.[0];
    if (imagePath && imagePath.path) {
        updatedBanner.image = imagePath.path;
    }

    await updatedBanner.save();

    res.status(200).json({ status: true, message: "Banner updated succefully", data: updatedBanner });

});