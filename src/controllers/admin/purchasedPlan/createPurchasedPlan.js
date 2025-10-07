const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const PurchasedPlan = require("../../../models/purchasedPlan"); // Your new model
const Package = require("../../../models/package");

exports.createPurchasedPlan = catchAsync(async (req, res, next) => {
  const user = req.user; // Authenticated user (admin/reseller/lco)
  const {
    userId,
    userModel = "User",
    packageId,
    amountPaid,
    paymentMethod,
    startDate, // Optional: allow override
    remarks
  } = req.body;

  if (!userId || !packageId || !amountPaid) {
    return next(new AppError("userId, packageId and amountPaid are required", 400));
  }

  // Fetch package to calculate expiry
  const selectedPackage = await Package.findById(packageId);
  if (!selectedPackage) return next(new AppError("Package not found", 404));

  const validityNumber = selectedPackage.validity.number;
  const validityUnit = selectedPackage.validity.unit.toLowerCase(); // "day", "month", etc.

  // Calculate start & expiry dates
  const start = startDate ? new Date(startDate) : new Date();
  const expiry = new Date(start);

  switch (validityUnit) {
    case "day":
      expiry.setDate(expiry.getDate() + validityNumber);
      break;
    case "week":
      expiry.setDate(expiry.getDate() + validityNumber * 7);
      break;
    case "month":
      expiry.setMonth(expiry.getMonth() + validityNumber);
      break;
    case "year":
      expiry.setFullYear(expiry.getFullYear() + validityNumber);
      break;
    default:
      return next(new AppError("Invalid validity unit in package", 400));
  }

  // Create new PurchasedPlan entry
  const newPurchase = await PurchasedPlan.create({
    userId,
    userModel,
    packageId,
    purchasedByRole: user.role,
    purchasedById: user._id,
    amountPaid,
    paymentMethod,
    purchaseDate: new Date(),
    startDate: start,
    expiryDate: expiry,
    status: "active",
    remarks
  });

  successResponse(res, "Plan purchased successfully", newPurchase);
});
