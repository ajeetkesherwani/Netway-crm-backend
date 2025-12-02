const Vendor = require("../../../models_old/vendor");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const bcrypt = require("bcrypt");
const { successResponse } = require("../../../utils/responseHandler");

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

exports.signUp = catchAsync(async (req, res, next) => {
  try {
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

    let vendor = await Vendor.findOne({ mobile });
    let shopId;
    // Update all fields
    shopId = vendor.shopId || generateShopId(shopName);
    vendor.shopName = shopName;
    vendor.serviceId = serviceId;
    vendor.shopNumber = shopNumber;
    vendor.shopAddress = shopAddress;
    vendor.city = city;
    vendor.landmark = landmark;
    vendor.pinCode = pinCode;
    vendor.email = email;
    vendor.isGstRegistered = isGstRegistered;
    vendor.gstNo = gstNo;
    vendor.ownerName = ownerName;
    vendor.panNo = panNo;
    vendor.fullNameOnPan = fullNameOnPan;
    vendor.panImages = panImages;
    vendor.commission = commission || 0;
    vendor.wallet_balance = wallet_balance || 0;
    vendor.accountNo = accountNo;
    vendor.ifsc = ifsc;
    vendor.bankName = bankName;
    vendor.holderName = holderName;
    vendor.accountType = accountType;
    vendor.profileImg = profileImg;
    vendor.shopImages = shopImages;
    vendor.digitalSignature = digitalSignature;
    vendor.agreementAccepted = true;
    await vendor.save();

    return successResponse(res, "Vendor registered successfully.", vendor, 201);
  } catch (err) {
    console.error("Error in signUp:", err);
    return next(err);
  }
});
