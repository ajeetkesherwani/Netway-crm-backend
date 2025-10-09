const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const bcrypt = require("bcryptjs");

exports.updateUser = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    if (!userId) return next(new AppError("User ID is required", 400));

    const user = await User.findById(userId);
    if (!user) return next(new AppError("User not found", 404));

    const updatableFields = [
        "name", "username", "state", "password", "createdFor"
    ];

    if (req.body.generalInformation) {
        const generalInfo = req.body.generalInformation;

        // Update only provided fields
        for (const field of updatableFields) {
            if (generalInfo[field] !== undefined) {
                if (field === "password") {
                    // Save plain password
                    user.generalInformation.plainPassword = generalInfo.password;
                    user.generalInformation.password = await bcrypt.hash(generalInfo.password, 10);
                } else {
                    user.generalInformation[field] = generalInfo[field];
                }
            }
        }

        // Handle createdFor separately
        if (generalInfo.createdFor && generalInfo.createdFor.id && generalInfo.createdFor.type) {
            user.generalInformation.createdFor = {
                id: generalInfo.createdFor.id,
                type: generalInfo.createdFor.type
            };
        }
    }

    // Update networkInformation if provided
    if (req.body.networkInformation) {
        user.networkInformation = {
            ...user.networkInformation,
            ...req.body.networkInformation
        };
    }

    // Update additionalInformation if provided
    if (req.body.additionalInformation) {
        user.additionalInformation = {
            ...user.additionalInformation,
            ...req.body.additionalInformation
        };
    }

    // Update document if provided
    if (req.body.document) {
        user.document = {
            ...user.document,
            ...req.body.document
        };
    }

    user.generalInformation.updatedAt = new Date();

    await user.save();

    successResponse(res, "User updated successfully", user);
});
