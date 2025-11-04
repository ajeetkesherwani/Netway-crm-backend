const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const fs = require("fs");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteLcoDocument = catchAsync(async (req, res, next) => {
    const { lcoId } = req.params;
    const { type, fileName } = req.body; // Example: type = "aadhaarCard"

    if (!lcoId) return next(new AppError("LCO ID is required", 400));
    if (!type) return next(new AppError("Document type is required", 400));

    // Find LCO
    const lco = await Lco.findById(lcoId);
    if (!lco) return next(new AppError("LCO not found", 404));

    // Validate document type
    if (!lco.document || !Array.isArray(lco.document[type])) {
        return next(new AppError("Invalid document type", 400));
    }

    //CASE 1 — Delete a single file if fileName provided
    if (fileName) {
        const fileIndex = lco.document[type].indexOf(fileName);

        if (fileIndex === -1) {
            return next(new AppError("File not found in this document type", 404));
        }

        // Delete from server
        try {
            if (fs.existsSync(fileName)) {
                fs.unlinkSync(fileName);

            }
        } catch (err) {
            console.error("Error deleting file from server:", err);
        }

        // Remove file from array
        lco.document[type].splice(fileIndex, 1);
        await lco.save();

        return successResponse(res, `File deleted successfully from ${type}`, lco);
    }

    // CASE 2 — Delete entire document type (all images)
    if (lco.document[type].length === 0) {
        return next(new AppError(`No files found in ${type}`, 404));
    }

    // Delete all files of that type
    lco.document[type].forEach((filePath) => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            console.error("Error deleting file:", err);
        }
    });

    // Clear the array for that document type
    lco.document[type] = [];
    await lco.save();

    successResponse(res, `All files deleted successfully from ${type}`, lco);
});
