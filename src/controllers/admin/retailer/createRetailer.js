const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createRetailer = catchAsync(async (req, res, next) => {

    const { title, phoneNo, password, email, resellerName, houseNo, pincode, area, subArea, mobileNo,
        fax, messengerId, dob, balance, dashboard, panNumber, resellerCode, contactPersonNumber,
        whatsAppNumber, address, taluka, state, country, website, annversaryDate, latitude, longitude,
        gstNo, contactPersonName, supportEmail, nas, description, status, roleId } = req.body;

    if (!resellerName) return next(new AppError("reseller name is required", 400));
    if(!password) return next(new AppError("password is required",400));
    if (!mobileNo) return next(new AppError("mobileNo is required", 400));
    if (!state) return next(new AppError("state is required", 400));
    if(!roleId) return next(new AppError("roleId is required",400));


    const retailer = new Retailer({
        title, phoneNo, email, password, resellerName, houseNo, pincode, area, subArea,
        mobileNo, fax, messengerId, dob, balance, dashboard, panNumber, resellerCode, contactPersonNumber,
        whatsAppNumber, address, taluka, state, country, website, annversaryDate, latitude, longitude,
        gstNo, contactPersonName, supportEmail, nas, description, status, roleId
    });

    retailer.save();

    successResponse(res, "Retailer created successfully", retailer);

});