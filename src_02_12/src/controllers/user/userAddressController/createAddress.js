const UserAddress = require("../../../models/userAddresses");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

const validateRequiredField = (field, fieldName) => {
  if (!field || !field.trim())
    return new AppError(`${fieldName} is required.`, 400);
  return null;
};

exports.createAddress = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
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

    const newAddress = new UserAddress({
      userId: userId,
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
    });

    await newAddress.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: newAddress,
    });
  } catch (error) {
    console.error("Add Address Error:", error);
    return new AppError("Failed to add address", 500);
  }
});
