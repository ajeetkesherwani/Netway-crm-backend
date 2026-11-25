const Hardware = require("../../../models/hardware");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const { createLog } = require("../../../utils/userLogActivity");

exports.assignHardwareToUser = (async (req, res, next) => {

    const { userId, hardwareId } = req.body;
    console.log(req.body, "req.body")

    if (!userId || !hardwareId) return next(new AppError("userId & hardwareId are required", 400));

    const user = await User.findById(userId);
    if (!user) return next(new AppError("user not found", 404));

    const hardware = await Hardware.findById(hardwareId);
    if (!hardware) return next(new AppError("hardwareId not found", 404));

    // Assign hardware to user
    hardware.assignedTo = user._id;
    await hardware.save();

    // Push hardware into user's assigned list (avoid duplicates)
    if (!user.assignedHardware.includes(hardware._id)) {
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

    successResponse(res, "Hardware assigned successfully", {
        user: {
            id: user._id,
            name: user.name,
            assignedHardware: user.assignedHardware
        },
        hardware: {
            id: hardware._id,
            hardwareName: hardware.hardwareName,
            assignedTo: hardware.assignedTo
        }
    });

})