const Staff = require("../../../models/Staff");
const Hardware = require("../../../models/hardware");
const StockCategory = require("../../../models/stockCategory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getStaffDetails = catchAsync(async (req, res, next) => {
    const { staffId } = req.params;

    if (!staffId) {
        return next(new AppError("Staff ID is required", 400));
    }

    const staff = await Staff.findById(staffId).lean();
    if (!staff) {
        return next(new AppError("Staff not found", 404));
    }

    const filter = String(req.query.filter || "").toLowerCase().replace(/[-_\s]/g, "");
    if (["hardware", "warestock", "warestack", "warehouse", "hardwarestock"].includes(filter)) {
        staff.assignedHardware = await Hardware.find({ assignedToStaff: staffId })
            .select("hardwareName hardwareType brand model serialNumber price purchaseDate warrantyExpiry status")
            .sort({ updatedAt: -1 })
            .lean();
    } else if (["productstock", "stock"].includes(filter)) {
        staff.assignedProductStock = await StockCategory.find({ assignedToEngineer: staffId })
            .sort({ updatedAt: -1 })
            .lean();
    }

    successResponse(res, "Staff details fetched successfully", staff);

});
