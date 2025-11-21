const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateLco = catchAsync(async (req, res, next) => {
    const { lcoId } = req.params;
    if (!lcoId) return next(new AppError("LCO ID is required", 400));

    const body = req.body || {};

    // prevent employee updates via this route
    if (body.employeeAssociation) delete body.employeeAssociation;

    // allowed fields to update
    const updatableFields = [
        "title", "phoneNo", "email", "lcoName", "district", "houseNo", "pincode", "area",
        "subArea", "mobileNo", "fax", "messengerId", "dob", "balance", "dashboard",
        "panNumber", "lcoCode", "contactPersonNumber", "whatsAppNumber", "address",
        "taluka", "state", "country", "website", "annversaryDate", "latitude", "longitude",
        "gstNo", "contactPersonName", "supportEmail", "nas", "description", "status", "role"
    ];

    // prepare update object
    const setFields = {};
    for (const field of updatableFields) {
        if (body[field] !== undefined && body[field] !== "") {
            setFields[field] = body[field];
        }
    }

    // Handle document uploads → REPLACE documents, NOT append
    const documentData = {};
    if (req.files) {
        if (req.files.aadhaarCard) {
            documentData.aadhaarCard = req.files.aadhaarCard.map(f =>
                f.path.replace(/\\/g, "/")
            );
        }
        if (req.files.panCard) {
            documentData.panCard = req.files.panCard.map(f =>
                f.path.replace(/\\/g, "/")
            );
        }
        if (req.files.license) {
            documentData.license = req.files.license.map(f =>
                f.path.replace(/\\/g, "/")
            );
        }
        if (req.files.other) {
            documentData.other = req.files.other.map(f =>
                f.path.replace(/\\/g, "/")
            );
        }
    }

    // build final query
    const updateQuery = {};
    if (Object.keys(setFields).length > 0) updateQuery.$set = setFields;

    // 🔥 Replace documents completely (overwrite old)
    if (Object.keys(documentData).length > 0) {
        updateQuery.$set = updateQuery.$set || {};
        for (const key in documentData) {
            updateQuery.$set[`document.${key}`] = documentData[key];
        }
    }

    // validate if nothing to update
    if (Object.keys(updateQuery).length === 0) {
        return next(new AppError("No valid fields provided for update", 400));
    }

    // perform update
    const updatedLco = await Lco.findByIdAndUpdate(lcoId, updateQuery, {
        new: true,
        runValidators: true,
    });

    if (!updatedLco) return next(new AppError("LCO not found", 404));

    successResponse(res, "LCO updated successfully", updatedLco);
});
