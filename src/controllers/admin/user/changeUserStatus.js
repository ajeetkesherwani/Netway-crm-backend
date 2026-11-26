const mongoose = require("mongoose");
const User = require("../../../models/user");
const { createLog } = require("../../../utils/userLogActivity");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.updateUserStatus = catchAsync(async (req, res, next) => {
    const { userId, status } = req.body;
    console.log(req.body, "req.body")

    // 1️⃣ Validation
    if (!userId || !status) {
        return next(new AppError("userId and status are required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError("Invalid userId", 400));
    }

    const allowedStatuses = ["active", "Inactive", "Suspend"];
    if (!allowedStatuses.includes(status)) {
        return next(new AppError(`Status must be one of: ${allowedStatuses.join(", ")}`, 400));
    }

    // 2️⃣ Find User
    const user = await User.findById(userId);
    if (!user) return next(new AppError("User not found", 404));
    console.log(user, "User");

    // 3️⃣ Update status
    const oldStatus = user.status;
    user.status = status;
    await user.save();


    //--- Log Activity ---
    const customerName = user.generalInformation?.name || user._id.toString();
    const customerEmail = user.generalInformation?.email || "Not provided";
    const customerPhone = user.generalInformation?.phone || "Not provided";
    const billingAddress = user.addressDetails?.billingAddress || {};
    const billingAddressText = [
        billingAddress.addressine1,
        billingAddress.addressine2,
        billingAddress.city,
        billingAddress.state,
        billingAddress.pincode,
    ].filter(Boolean).join(", ");
    const updatedByName =
        req.user?.name || req.user?.adminName || req.user?.role || "Unknown";

    await createLog({
        userId: user._id,
        type: "User Status Updated",
        description: [
            `User status updated successfully for ${customerName}`,
            `Email: ${customerEmail}`,
            `Phone: ${customerPhone}`,
            `Billing address: ${billingAddressText || "Not provided"}`,
            `Status changed from ${oldStatus} to ${user.status}`,
            `Updated by: ${updatedByName}`,
        ].join(". "),
        details: {
            customerName,
            customerEmail,
            customerPhone,
            billingAddress,
            oldStatus,
            newStatus: user.status,
            updatedByName,
            updatedByRole: req.user?.role || "Admin",
        },
        ip: req.ip || req.headers["x-forwarded-for"] || "0.0.0.0",
        addedBy: {
            id: req.user._id,
            role: req.user.role || "Admin",
            name: updatedByName,
        },
        targetName: user.generalInformation?.name,
    });


    // 5️⃣ Return response
    successResponse(res, "User status updated successfully", {
        userId: user._id,
        oldStatus,
        newStatus: user.status
    });
});
