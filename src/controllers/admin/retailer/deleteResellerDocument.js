const Retailer = require("../../../models/retailer");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const fs = require("fs");
const { successResponse } = require("../../../utils/responseHandler");

exports.deleteRetailerDocument = catchAsync(async (req, res, next) => {
    const { retailerId } = req.params;
    const { type, fileName } = req.body; // Example: type = "aadhaarCard"

    if (!retailerId) return next(new AppError("Retailer ID is required", 400));
    if (!type) return next(new AppError("Document type is required", 400));

    // Find retailer
    const retailer = await Retailer.findById(retailerId);
    if (!retailer) return next(new AppError("Retailer not found", 404));

    // Validate document type
    if (!retailer.document || !Array.isArray(retailer.document[type])) {
        return next(new AppError("Invalid document type", 400));
    }

    // CASE 1 — Delete a single file if fileName provided
    if (fileName) {
        const fileIndex = retailer.document[type].indexOf(fileName);

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

        // Remove from array
        retailer.document[type].splice(fileIndex, 1);
        await retailer.save();

        return successResponse(res, `File deleted successfully from ${type}`, retailer);
    }

    // CASE 2 — Delete entire document type (all images)
    if (retailer.document[type].length === 0) {
        return next(new AppError(`No files found in ${type}`, 404));
    }

    // Delete all files of that type
    retailer.document[type].forEach((filePath) => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            console.error("Error deleting file:", err);
        }
    });

    // Clear the array
    retailer.document[type] = [];
    await retailer.save();

    successResponse(res, `All files deleted successfully from ${type}`, retailer);
});
