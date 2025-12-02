const UserPackage = require("../../../models/userPackage");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");  


exports.updateUserPackageStatus = catchAsync(async (req, res, next) => {
    const packageId = req.params.packageId;   
    const { status } = req.body;    

    // Validate status
    const validStatuses = ["active", "expired", "inactive"];    

    if (!validStatuses.includes(status)) {
        return next(new AppError("Invalid status value", 400));
    }   


    const updatedPackage = await UserPackage.findByIdAndUpdate(
        packageId,
        { status },
        { new: true }
    );  

    if (!updatedPackage) {
        return next(new AppError("User package not found", 404));
    }

    return successResponse(res, "Package status updated successfully", updatedPackage);
});
