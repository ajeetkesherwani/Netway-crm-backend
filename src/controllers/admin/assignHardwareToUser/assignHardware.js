const Hardware = require("../../../models/hardware");
const User = require("../../../models/user");
const Staff = require("../../../models/Staff");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const { createLog } = require("../../../utils/userLogActivity");
const logMonitoringActivity = require("../../../utils/logMonitoringActivity");

exports.assignHardwareToUser = catchAsync(async (req, res, next) => {
    const { userId, staffId, hardwareId } = req.body;

    if (!hardwareId || Boolean(userId) === Boolean(staffId)) {
        return next(new AppError("hardwareId and exactly one of userId or staffId are required", 400));
    }

    const hardware = await Hardware.findById(hardwareId);
    if (!hardware) return next(new AppError("hardwareId not found", 404));

    if (staffId) {
        const staff = await Staff.findById(staffId);
        if (!staff) return next(new AppError("Staff not found", 404));

        const previousUserId = hardware.assignedTo;
        hardware.assignedTo = null;
        hardware.assignedToStaff = staff._id;
        await hardware.save();

        if (previousUserId) {
            await User.updateOne(
                { _id: previousUserId },
                { $pull: { assignedHardware: hardware._id } }
            );
        }

        await logMonitoringActivity({
            req,
            action: "Hardware Assigned",
            module: "hardware",
            description: `Hardware ${hardware.hardwareName} assigned to ${staff.staffName || staff.name}`,
            targetId: hardware._id,
            targetName: hardware.hardwareName,
            targetType: "hardware",
            details: {
                staffId: staff._id,
                staffName: staff.staffName || staff.name,
                hardwareId: hardware._id,
                hardwareName: hardware.hardwareName,
                hardwareType: hardware.hardwareType,
                brand: hardware.brand,
                model: hardware.model,
                serialNumber: hardware.serialNumber,
            },
        });

        return successResponse(res, "Hardware assigned successfully", {
            staff: {
                id: staff._id,
                name: staff.staffName || staff.name,
            },
            hardware: {
                id: hardware._id,
                hardwareName: hardware.hardwareName,
                assignedTo: hardware.assignedTo,
                assignedToStaff: hardware.assignedToStaff,
            },
        });
    }

    const user = await User.findById(userId);
    if (!user) return next(new AppError("user not found", 404));

    const previousUserId =
        hardware.assignedTo &&
        String(hardware.assignedTo) !== String(user._id)
            ? hardware.assignedTo
            : null;
    hardware.assignedTo = user._id;
    hardware.assignedToStaff = null;
    await hardware.save();

    if (previousUserId) {
        await User.updateOne(
            { _id: previousUserId },
            { $pull: { assignedHardware: hardware._id } }
        );
    }

    if (!user.assignedHardware.some((id) => String(id) === String(hardware._id))) {
        user.assignedHardware.push(hardware._id);
        await user.save();
    }

    await createLog({
        userId: user._id,
        type: "Hardware Assigned",
        description: `Hardware ${hardware.hardwareName} assigned to ${user.generalInformation?.name || userId}`,
        details: {
            customerId: user._id,
            customerName: user.generalInformation?.name,
            hardwareId: hardware._id,
            hardwareName: hardware.hardwareName,
            hardwareType: hardware.hardwareType,
            brand: hardware.brand,
            model: hardware.model,
            serialNumber: hardware.serialNumber,
            assignedById: req.user._id,
            assignedByRole: req.user.role,
        },
        addedBy: { id: req.user._id, role: req.user.role || "Admin" },
        ip: req.ip || req.headers["x-forwarded-for"],
        module: "hardware",
        targetType: "hardware",
        targetId: hardware._id,
        targetName: hardware.hardwareName,
    });

    return successResponse(res, "Hardware assigned successfully", {
        user: {
            id: user._id,
            name: user.name,
            assignedHardware: user.assignedHardware,
        },
        hardware: {
            id: hardware._id,
            hardwareName: hardware.hardwareName,
            assignedTo: hardware.assignedTo,
            assignedToStaff: hardware.assignedToStaff,
        },
    });
});