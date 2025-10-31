const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateLco = (async (req, res, next) => {

    const { lcoId } = req.params;
    if (!lcoId) return next(new AppError("lcoId is required", 400));

    const lco = await Lco.findById(lcoId);
    if (!lco) return next(new AppError("lco not found", 404));

    const updatableFields = [
        "title", "retailerId", "roleId", "lcoName", "password", "mobileNo", "address", "houseNo", "taluka", "pincode", "district",
        "area", "state", "country", "subArea", "telephone", "faxNo", "email", "messengerId", "website", "dob", "anniversaryDate",
        "latitude", "longitude", "lcoBalance", "gst", "panNo", "dashboard", "contactPersonName", "contactPersonNumber",
        "supportEmail", "supportWhatsApp", "lcoCode", "nas", "description", "status"
    ];

    updatableFields.forEach(field => {
        if (req.body[field] !== undefined) {
            lco[field] = req.body[field];
        }
    });

    await lco.save();

    successResponse(res, "lco updated successfully", lco);

});