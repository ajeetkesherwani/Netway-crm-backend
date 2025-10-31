const Setting = require("../../../models_old/setting");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createSetting = catchAsync(async (req, res, next) => {
    const { brandName,
        commission,
        gst,
        onboardingFee,
        plateformFee,
        finalPlateformFee,
        agreement,
        email,
        mobile,
        address,
        driver_commission, vendor_commission} = req.body;

    if (!brandName || !commission ||!onboardingFee || !plateformFee
        || !finalPlateformFee || !agreement || !email 
        || !mobile || !address || !driver_commission || !vendor_commission) {
        return next(new AppError("all fields are required", 400));
    }

    const logoFile = req?.files?.logo?.[0];
    const logo = logoFile?.path || "";


    const setting = new Setting({
        brandName, logo, commission, gst, onboardingFee, plateformFee, finalPlateformFee,
        agreement, email, mobile, address, driver_commission, vendor_commission
    });

    await setting.save();

    res.status(200).json({ status: true, message: " Setting created successfully", data: setting });


});