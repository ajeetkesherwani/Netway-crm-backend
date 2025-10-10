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

    // ✅ Update generalInformation
    if (req.body.generalInformation) {
        const generalInfo = req.body.generalInformation;

        for (const key in generalInfo) {
            if (generalInfo[key] !== undefined) {
                if (key === "password") {
                    user.generalInformation.plainPassword = generalInfo.password;
                    user.generalInformation.password = await bcrypt.hash(
                        generalInfo.password,
                        10
                    );
                } else if (key === "createdFor") {
                    if (generalInfo.createdFor.id && generalInfo.createdFor.type) {
                        user.generalInformation.createdFor = {
                            id: generalInfo.createdFor.id,
                            type: generalInfo.createdFor.type,
                        };
                    }
                } else {
                    user.generalInformation[key] = generalInfo[key];
                }
            }
        }

        user.markModified("generalInformation");
    }

    // ✅ Update networkInformation
    if (req.body.networkInformation) {
        const netInfo = req.body.networkInformation;
        for (const key in netInfo) {
            if (netInfo[key] !== undefined) {
                user.networkInformation[key] = netInfo[key];
            }
        }
        user.markModified("networkInformation");
    }

    // ✅ Update additionalInformation
    if (req.body.additionalInformation) {
        const addInfo = req.body.additionalInformation;
        for (const key in addInfo) {
            if (addInfo[key] !== undefined) {
                user.additionalInformation[key] = addInfo[key];
            }
        }
        user.markModified("additionalInformation");
    }

    // ✅ Update document
    if (req.body.document) {
        const docInfo = req.body.document;
        for (const key in docInfo) {
            if (docInfo[key] !== undefined) {
                user.document[key] = docInfo[key];
            }
        }
        user.markModified("document");
    }

    // ✅ Save and return updated user
    await user.save();
    const updatedUser = await User.findById(userId);

    successResponse(res, "User updated successfully", updatedUser);
});
