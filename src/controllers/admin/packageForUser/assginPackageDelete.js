const UserPackage = require("../../../models/userPackage");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");
const AppError = require("../../../utils/AppError");
const { createLog } = require("../../../utils/userLogActivity");

exports.deleteAssignedPackage = catchAsync(async (req, res, next) => {
    const packageId = req.params.packageId;

    const deletedPackage = await UserPackage.findByIdAndDelete(packageId);

    if (!deletedPackage) {
        return next(new AppError("Assigned package not found", 404));
    }

    await createLog({
        userId: deletedPackage.userId,
        type: "Assigned Package Deleted",
        description: `Package ${deletedPackage.packageName} assignment deleted for customer ${deletedPackage.userId}`,
        details: {
            assignmentId: deletedPackage._id,
            customerId: deletedPackage.userId,
            packageId: deletedPackage.packageId,
            packageName: deletedPackage.packageName,
            status: deletedPackage.status,
            basePrice: deletedPackage.basePrice,
            customPrice: deletedPackage.customPrice,
            deletedById: req.user._id,
            deletedByRole: req.user.role,
        },
        addedBy: { id: req.user._id, role: req.user.role || "Admin" },
        ip: req.ip || req.headers["x-forwarded-for"],
        module: "package-assignment",
        targetType: "userPackage",
        targetId: deletedPackage._id,
        targetName: deletedPackage.packageName,
    });

    return successResponse(res, "Assigned package deleted successfully", deletedPackage);
});


exports.deleteAssignedPackage = catchAsync(async (req, res, next) => {
    const packageId = req.params.packageId;

    const deletedPackage = await UserPackage.findByIdAndDelete(packageId);

    if (!deletedPackage) {
        return next(new AppError("Assigned package not found", 404));
    }

    await createLog({
        userId: deletedPackage.userId,
        type: "Assigned Package Deleted",
        description: `Package ${deletedPackage.packageName} assignment deleted for customer ${deletedPackage.userId}`,
        details: {
            assignmentId: deletedPackage._id,
            customerId: deletedPackage.userId,
            packageId: deletedPackage.packageId,
            packageName: deletedPackage.packageName,
            status: deletedPackage.status,
            basePrice: deletedPackage.basePrice,
            customPrice: deletedPackage.customPrice,
            deletedById: req.user._id,
            deletedByRole: req.user.role,
        },
        addedBy: { id: req.user._id, role: req.user.role || "Admin" },
        ip: req.ip || req.headers["x-forwarded-for"],
        module: "package-assignment",
        targetType: "userPackage",
        targetId: deletedPackage._id,
        targetName: deletedPackage.packageName,
    });

    return successResponse(res, "Assigned package deleted successfully", deletedPackage);
});
