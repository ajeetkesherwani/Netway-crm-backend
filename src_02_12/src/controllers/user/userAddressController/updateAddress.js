const UserAddress = require("../../../models/userAddresses");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

const validateRequiredField = (field, fieldName) => {
  if (!field || !field.trim())
    return new AppError(`${fieldName} is required.`, 400);
  return null;
};

exports.updateAddress = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const addressId = req.params.id;
  try {
    const {
      fullName,
      mobileNumber,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      pincode,
      latitude,
      longitude,
      addressType,
      isDefault,
    } = req.body;

    const requiredFields = [
      { field: fullName, name: "fullName" },
      { field: mobileNumber, name: "mobileNumber" },
      { field: addressLine1, name: "addressLine1" },
      { field: city, name: "city" },
      { field: addressType, name: "addressType" },
    ];

    for (const { field, name } of requiredFields) {
      const error = validateRequiredField(field, name);
      if (error) return next(error);
    }

    if (isDefault) {
      await UserAddress.updateMany({ userId }, { isDefault: false });
    }
    const existingAddress = await UserAddress.findOne({
      _id: addressId,
      userId,
    });
    if (!existingAddress) {
      return next(
        new AppError("Address not found or does not belong to user", 404)
      );
    }

    existingAddress.fullName = fullName;
    existingAddress.mobileNumber = mobileNumber;
    existingAddress.addressLine1 = addressLine1;
    existingAddress.addressLine2 = addressLine2;
    existingAddress.landmark = landmark;
    existingAddress.city = city;
    existingAddress.state = state;
    existingAddress.country = country;
    existingAddress.pincode = pincode;
    existingAddress.latitude = latitude;
    existingAddress.longitude = longitude;
    existingAddress.addressType = addressType;
    existingAddress.isDefault = isDefault;
    await existingAddress.save();

    res.status(201).json({
      success: true,
      message: "Address updated successfully",
      data: existingAddress,
    });
  } catch (error) {
    console.error("Update Address Error:", error);
    return next(new AppError("Failed to add address", 500));
  }
});
