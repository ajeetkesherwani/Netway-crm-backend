const Setting = require("../../../models_old/setting");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllSetting = catchAsync(async(req, res, next) => {
     
    const allSetting = await Setting.find();
    if(!allSetting){
        return next(new AppError("Settings not found", 404));
    } 

    res.status(200).json({ status: true, message: "ALl settings found", count: allSetting.length, data: allSetting });

});