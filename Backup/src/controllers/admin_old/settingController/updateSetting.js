const Setting = require("../../../models_old/setting");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateSetting = catchAsync(async(req, res, next) => {

    const id = req.params.id;
    if(!id) return next(new AppError("id is required", 400));

     const { brandName,
        commission,
        gst,
        onboardingFee,
        plateformFee,
        finalPlateformFee,
        agreement,
        email,
        mobile,
        address, } = req.body;

    const updatedSetting = await Setting.findById(id);
    if(!updatedSetting){
        return next(new AppError("Setting not found", 404));
    }

  const logoFile = req?.files?.logo?.[0];
  if (logoFile && logoFile.path) {
    updatedSetting.logo = logoFile.path;
  }

  updatedSetting.brandName = brandName || updatedSetting.brandName
  updatedSetting.commission = commission || updatedSetting.commission;
  updatedSetting.gst = gst || updatedSetting.gst;
  updatedSetting.onboardingFee = onboardingFee || updatedSetting.onboardingFee;
  updatedSetting.plateformFee = plateformFee || updatedSetting.plateformFee;
  updatedSetting.finialPlateFormFee = finalPlateformFee || updatedSetting.finialPlateFormFee;
  updatedSetting.agreement = agreement || updatedSetting.agreement
  updatedSetting.email = email || updatedSetting.email;
  updatedSetting.mobile = mobile || updatedSetting.mobile;
  updatedSetting.address = address || updatedSetting.address;


await updatedSetting.save();

res.status(200).json({ status: true, message: "setting updated successfully", data: updatedSetting });

});