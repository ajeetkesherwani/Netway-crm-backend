const Hardware = require("../../../models/hardware");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createHardware = catchAsync(async (req, res, next) => {

    const { hardwareName, hardwareType, brand, model, serialNumber, ipAddress, macAddress, portCount, cableLength,
        location, purchaseDate, warrantyExpiry, price, notes, status
    } = req.body;

    if (!hardwareName) return next(new AppError("hardware name is required", 400));

    const hardware = await Hardware.create({
        hardwareName, hardwareType, brand, model, serialNumber, ipAddress, macAddress, portCount, cableLength,
        location, purchaseDate, warrantyExpiry, price, notes, status
    });

    await hardware.save();

    successResponse(res, "hardware created successfully", hardware);

});
