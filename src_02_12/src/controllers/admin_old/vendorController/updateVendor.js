const Vendor = require("../../../models_old/vendor");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

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

exports.updateVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  if (!vendorId) return next(new AppError("Vendor ID is required", 400));

  const existingVendor = await Vendor.findById(vendorId);
  if (!existingVendor) return next(new AppError("Vendor not found", 404));

  const files = req.files;

  // Process new uploaded images (if any)
  const profileImg = processImages(files, "profileImg")[0] || existingVendor.profileImg;
  const shopImages = processImages(files, "shopImages");
  const panImages = processImages(files, "panImages");
  const digitalSignature = processImages(files, "digitalSignature")[0] || existingVendor.digitalSignature;

  const updateData = {
    ...req.body,
    profileImg,
    digitalSignature,
    shopImages: shopImages.length > 0 ? shopImages : existingVendor.shopImages,
    panImages: panImages.length > 0 ? panImages : existingVendor.panImages,
  };

  // Unique check for mobile if changed
  if (req.body.mobile && req.body.mobile !== existingVendor.mobile) {
    const mobileExists = await Vendor.findOne({ mobile: req.body.mobile });
    if (mobileExists)
      return next(new AppError("Mobile number already exists", 400));
  }

  // Unique check for email if changed
  if (req.body.email && req.body.email !== existingVendor.email) {
    const emailExists = await Vendor.findOne({ email: req.body.email });
    if (emailExists)
      return next(new AppError("Email already exists", 400));
  }

  const updatedVendor = await Vendor.findByIdAndUpdate(
    vendorId,
    updateData,
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "Vendor updated successfully.",
    vendor: updatedVendor,
  });
});
