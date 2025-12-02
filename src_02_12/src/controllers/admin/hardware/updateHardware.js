const Hardware = require("../../../models/hardware");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateHardware = catchAsync(async (req, res, next) => {
    const { hardwareId } = req.params;

    // Find existing hardware
    const hardware = await Hardware.findById(hardwareId);
    if (!hardware) return next(new AppError("Hardware not found", 404));

    // Update fields dynamically
    const updateFields = [
        "hardwareName", "hardwareType", "brand", "model", "serialNumber",
        "ipAddress", "macAddress", "portCount", "cableLength",
        "location", "purchaseDate", "warrantyExpiry", "price", "notes", "status"
    ];

    updateFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            hardware[field] = req.body[field];
        }
    });

    await hardware.save();

    successResponse(res, "Hardware updated successfully", hardware);
});
