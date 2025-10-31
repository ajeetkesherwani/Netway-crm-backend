const Vendor = require("../../../models_old/vendor");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const bcrypt = require("bcrypt");

function generateShopId(shopName) {
  const shopPrefix = shopName.slice(0, 5).toUpperCase().padEnd(5, "A");
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const shopId = `${shopPrefix}${randomDigits}`;

  return shopId;
}

const processImages = (files, fieldName) => {
  if (files && files[fieldName]) {
    if (Array.isArray(files[fieldName])) {
      return files[fieldName].map((file) => file.path);
    } else {
      return [files[fieldName].path];
    }
  }
  return [];
};

const validateRequiredField = (field, fieldName) => {
  if (!field || !field.trim())
    return new AppError(`${fieldName} is required.`, 400);
  return null;
};

exports.createVendor = catchAsync(async (req, res, next) => {
  let {
    shopName,
    serviceId,
    shopNumber,
    shopAddress,
    city,
    landmark,
    pinCode,
    mobile,
    isGstRegistered,
    gstNo,
    ownerName,
    email,
    panNo,
    fullNameOnPan,
    accountNo,
    ifsc,
    bankName,
    holderName,
    accountType,
    commission,
    wallet_balance,
  } = req.body;

  const files = req.files;

  // Process images
  const profileImg = processImages(files, "profileImg")[0] || ""; // single image field
  const shopImages = processImages(files, "shopImages"); // multiple images field
  const panImages = processImages(files, "panImages"); // multiple images field
  const digitalSignature = processImages(files, "digitalSignature")[0] || ""; // single image field

  const requiredFields = [
    { field: shopName, name: "Shop Name" },
    { field: serviceId, name: "Service ID" },
    { field: shopNumber, name: "Shop Number" },
    { field: shopAddress, name: "Shop Address" },
    { field: city, name: "City" },
    { field: landmark, name: "Landmark" },
    { field: pinCode, name: "Pincode" },
    { field: isGstRegistered, name: "GST Registration Status" },
    { field: gstNo, name: "GST Number" },
    { field: mobile, name: "Mobile Number" },
    { field: ownerName, name: "Owner Name" },
    { field: email, name: "Email" },
    { field: panNo, name: "PAN Number" },
    { field: fullNameOnPan, name: "Full Name on PAN" },
    { field: accountNo, name: "Account Number" },
    { field: ifsc, name: "IFSC Code" },
    { field: bankName, name: "Bank Name" },
    { field: holderName, name: "Account Holder Name" },
    { field: accountType, name: "Account Type" },
    { field: digitalSignature, name: "Digital Signature" },
  ];

  for (const { field, name } of requiredFields) {
    const error = validateRequiredField(field, name);
    if (error) return next(error);
  }

  const existingMobile = await Vendor.findOne({ mobile });
  if (existingMobile)
    return next(
      new AppError(
        "Mobile number already exists. Please use a different one.",
        400
      )
    );

  shopId = generateShopId(shopName);
  console.log("Generated Shop ID:", shopId);

  const newVendor = await Vendor.create({
    shopName,
    shopId,
    serviceId,
    shopNumber,
    shopAddress,
    city,
    landmark,
    pinCode,
    mobile,
    email,
    isGstRegistered,
    gstNo,
    ownerName,
    panNo,
    fullNameOnPan,
    panImages,
    commission: commission || 0,
    wallet_balance: wallet_balance || 0,
    accountNo,
    ifsc,
    bankName,
    holderName,
    accountType,
    profileImg,
    shopImages,
    digitalSignature,
    agreementAccepted: true,
  });

  return res.status(201).json({
    success: true,
    message: "Vendor registered successfully.",
    vendor: newVendor,
  });
});
