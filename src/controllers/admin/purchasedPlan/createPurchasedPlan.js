const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const PurchasedPlan = require("../../../models/purchasedPlan");
const Package = require("../../../models/package");
const User = require("../../../models/user");
const UserWalletHistory = require("../../../models/userWalletHistory");

exports.createPurchasedPlan = catchAsync(async (req, res, next) => {
  const purchaser = req.user; // Admin / Reseller / LCO performing the purchase

  const {
    userId,
    userModel = "User",
    packageId,
    amountPaid,
    paymentMethod,
    startDate, // optional
    remarks,
    isPaymentRecived
  } = req.body;

  // ---------------- Validation ---------------- //
  if (!userId || !packageId || !amountPaid) {
    return next(new AppError("userId, packageId and amountPaid are required", 400));
  }

  // ---------------- Fetch Package ---------------- //
  const selectedPackage = await Package.findById(packageId);
  if (!selectedPackage) return next(new AppError("Package not found", 404));

  const packagePrice = Number(selectedPackage.basePrice || selectedPackage.offerPrice || 0);

  // Check if the purchaser has enough wallet balance
  if (purchaser.role === "Reseller" || purchaser.role === "Lco") {
    const walletBalance = purchaser.walletBalance || 0;
    console.log("Purchaser wallet balance:", walletBalance);

    if (walletBalance < packagePrice) {
      return next(new AppError("Insufficient wallet balance in purchaser account", 400));
    }
  }


  // ---------------- Calculate validity ---------------- //
  const validityNumber = selectedPackage.validity.number;
  const validityUnit = selectedPackage.validity.unit.toLowerCase();

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

  // ---------------- Create Purchased Plan ---------------- //
  const newPurchase = await PurchasedPlan.create({
    userId,
    userModel,
    packageId,
    purchasedByRole: purchaser.role,
    purchasedById: purchaser._id,
    amountPaid,
    paymentMethod,
    purchaseDate: new Date(),
    startDate: start,
    expiryDate: expiry,
    status: "active",
    remarks,
  });

  // ---------------- Fetch Target User ---------------- //
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return next(new AppError("Target user not found", 404));
  }

  // ---------------- Manage User Wallet ---------------- //
  const openingBalance = targetUser.walletBalance || 0;
  const transferAmount = packagePrice;
  let closingBalance = openingBalance;
  let transactionType;

  if (!isPaymentRecived) {
    // Payment not received → deduct from user wallet
    closingBalance = openingBalance - packagePrice;
    transactionType = "debit";

    // update user wallet
    await User.findByIdAndUpdate(userId, { walletBalance: closingBalance });
  } else {
    // Payment received → wallet unchanged
    closingBalance = openingBalance;
    transactionType = "credit";
  }

  // ---------------- Create User Wallet History ---------------- //
  await UserWalletHistory.create({
    userId,
    transactionType,
    openingBalance,
    transferAmount,
    closingBalance,
    relatedPurchasePlanId: newPurchase._id,
    remark: "plan Recharge"
  });

  // ---------------- Response ---------------- //
  return successResponse(res, "Plan purchased successfully", {
    purchasedPlan: newPurchase,
    walletHistory: {
      openingBalance,
      transferAmount,
      closingBalance,
      transactionType: !isPaymentRecived ? "debit" : "credit",
    },
  });
});
