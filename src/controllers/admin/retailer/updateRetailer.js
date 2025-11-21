const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateRetailer = catchAsync(async (req, res, next) => {
    const { retailerId } = req.params;
    if (!retailerId) return next(new AppError("Retailer ID is required", 400));

    const body = req.body || {};

    // Allowed fields update
    const updatableFields = [
        "title","phoneNo","email","resellerName","district","houseNo",
        "pincode","area","subArea","mobileNo","fax","messengerId",
        "dob","balance","dashboard","panNumber","resellerCode",
        "contactPersonNumber","whatsAppNumber","address","taluka",
        "state","country","website","annversaryDate","latitude",
        "longitude","gstNo","contactPersonName","supportEmail",
        "nas","description","status","role"
    ];

    const setFields = {};
    for (const field of updatableFields) {
        if (body[field] !== undefined && body[field] !== "") {
            setFields[field] = body[field];
        }
    }

    const updateQuery = {};
    if (Object.keys(setFields).length > 0) updateQuery.$set = setFields;

    // -----------------------------------
    // DOCUMENT UPDATE / REPLACE / REMOVE
    // -----------------------------------

    const docFields = ["aadhaarCard", "panCard", "license", "other"];

    docFields.forEach((doc) => {
        const removeKey = `remove_${doc}`; // example: remove_aadhaarCard = true
        if (body[removeKey] === "true") {
            updateQuery.$set = updateQuery.$set || {};
            updateQuery.$set[`document.${doc}`] = "";
        }
    });

    if (req.files) {
        if (req.files.aadhaarCard && req.files.aadhaarCard.length > 0) {
            updateQuery.$set = updateQuery.$set || {};
            updateQuery.$set["document.aadhaarCard"] =
                req.files.aadhaarCard[0].path.replace(/\\/g, "/");
        }

        if (req.files.panCard && req.files.panCard.length > 0) {
            updateQuery.$set = updateQuery.$set || {};
            updateQuery.$set["document.panCard"] =
                req.files.panCard[0].path.replace(/\\/g, "/");
        }

        if (req.files.license && req.files.license.length > 0) {
            updateQuery.$set = updateQuery.$set || {};
            updateQuery.$set["document.license"] =
                req.files.license[0].path.replace(/\\/g, "/");
        }

        if (req.files.other && req.files.other.length > 0) {
            updateQuery.$set = updateQuery.$set || {};
            updateQuery.$set["document.other"] =
                req.files.other[0].path.replace(/\\/g, "/");
        }
    }

    if (Object.keys(updateQuery).length === 0) {
        return next(new AppError("Nothing to update", 400));
    }

    const updatedRetailer = await Retailer.findByIdAndUpdate(retailerId, updateQuery, {
        new: true,
        runValidators: true,
    });

    if (!updatedRetailer) return next(new AppError("Retailer not found", 404));

    successResponse(res, "Retailer updated successfully", updatedRetailer);
});
