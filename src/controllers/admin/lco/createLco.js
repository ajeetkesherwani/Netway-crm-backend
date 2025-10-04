const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createLco = catchAsync(async (req, res, next) => {

    const { title, retailerId, roleId, lcoName, password, mobileNo, address, houseNo, taluka, pincode, district,
        area, state, country, subArea, telephone, faxNo, email, messengerId, website, dob, anniversaryDate,
        latitude, longitude, lcoBalance, gst, panNo, dashboard, contactPersonName, contactPersonNumber,
        supportEmail, supportWhatsApp, lcoCode, nas, description, status
    } = req.body;

    if (!retailerId) return next(new AppError("retailerId  is required", 400));
    if (!lcoName) return next(new AppError("lcoName is required", 400));
    if (!state) return next(new AppError("state is required", 400));
    if (!password) return next(new AppError("password is required", 400));

    const newLco = new Lco({
        title, retailerId, roleId, lcoName, password, mobileNo, address, houseNo, taluka, pincode, district,
        area, state, country, subArea, telephone, faxNo, email, messengerId, website, dob, anniversaryDate,
        latitude, longitude, lcoBalance, gst, panNo, dashboard, contactPersonName, contactPersonNumber,
        supportEmail, supportWhatsApp, lcoCode, nas, description, status
    });

    await newLco.save();

    successResponse(res, "new Lco created successfully", newLco);

});