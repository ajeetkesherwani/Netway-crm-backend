const UserPackage = require("../../../models/userPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");  
const { createLog } = require("../../../utils/userLogActivity");


exports.updateUserPackageStatus = catchAsync(async (req, res, next) => {
    const packageId = req.params.packageId;   
    const { status } = req.body;    

    // Validate status
    const validStatuses = ["active", "expired", "inactive"];    

    if (!validStatuses.includes(status)) {
        return next(new AppError("Invalid status value", 400));
    }   


    const previousPackage = await UserPackage.findById(packageId);
    if (!previousPackage) {
        return next(new AppError("User package not found", 404));
    }

    const updatedPackage = await UserPackage.findByIdAndUpdate(
        packageId,
        { status },
        { new: true }
    );  

    if (!updatedPackage) {
        return next(new AppError("User package not found", 404));
    }

    await createLog({
        userId: updatedPackage.userId,
        type: "Assigned Package Status Updated",
        description: `Package ${updatedPackage.packageName} status changed from ${previousPackage.status} to ${updatedPackage.status}`,
        details: {
            assignmentId: updatedPackage._id,
            customerId: updatedPackage.userId,
            packageId: updatedPackage.packageId,
            packageName: updatedPackage.packageName,
            previousStatus: previousPackage.status,
            newStatus: updatedPackage.status,
            updatedById: req.user._id,
            updatedByRole: req.user.role,
        },
        addedBy: { id: req.user._id, role: req.user.role || "Admin" },
        ip: req.ip || req.headers["x-forwarded-for"],
        module: "package-assignment",
        targetType: "userPackage",
        targetId: updatedPackage._id,
        targetName: updatedPackage.packageName,
    });

    return successResponse(res, "Package status updated successfully", updatedPackage);
});
