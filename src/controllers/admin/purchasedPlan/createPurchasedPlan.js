// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const { successResponse } = require("../../../utils/responseHandler");
// const PurchasedPlan = require("../../../models/purchasedPlan"); // Your new model
// const Package = require("../../../models/package");
// const User = require("../../../models/user")

// exports.createPurchasedPlan = catchAsync(async (req, res, next) => {
//   const user = req.user; // Authenticated user (admin/reseller/lco)
//   const {
//     userId,
//     userModel = "User",
//     packageId,
//     amountPaid,
//     paymentMethod,
//     startDate, // Optional: allow override
//     remarks,
//     isPaymentRecived
//   } = req.body;

//   console.log(user, "req.user");

//   if (!userId || !packageId || !amountPaid) {
//     return next(new AppError("userId, packageId and amountPaid are required", 400));
//   }

//   //................//chack wallet//..............//

//   // Fetch package to calculate expiry
//   const selectedPackage = await Package.findById(packageId);
//   if (!selectedPackage) return next(new AppError("Package not found", 404));



//   const packagePrice = Number(selectedPackage.basePrice || selectedPackage.offerPrice || 0);
//   console.log("Package price:", packagePrice);

//   // Check if the purchaser has enough wallet balance
//   if (user.role === "Reseller" || user.role === "Lco") {
//     const walletBalance = user.walletBalance || 0;
//     console.log("Purchaser wallet balance:", walletBalance);

//     if (walletBalance < packagePrice) {
//       return next(new AppError("Insufficient wallet balance in purchaser account", 400));
//     }
//   }


//   const validityNumber = selectedPackage.validity.number;
//   const validityUnit = selectedPackage.validity.unit.toLowerCase(); // "day", "month", etc.

//   // Calculate start & expiry dates
//   const start = startDate ? new Date(startDate) : new Date();
//   const expiry = new Date(start);

//   switch (validityUnit) {
//     case "day":
//       expiry.setDate(expiry.getDate() + validityNumber);
//       break;
//     case "week":
//       expiry.setDate(expiry.getDate() + validityNumber * 7);
//       break;
//     case "month":
//       expiry.setMonth(expiry.getMonth() + validityNumber);
//       break;
//     case "year":
//       expiry.setFullYear(expiry.getFullYear() + validityNumber);
//       break;
//     default:
//       return next(new AppError("Invalid validity unit in package", 400));
//   }

//   if (!isPaymentRecived) {
//     //
//     const userData = User.findById(userId);
//     const currentWalletBalance = user.walletBalance;
//     // const

//     user.wallet = currentWalletBalance - packagePrice;
//   }

//   // Create new PurchasedPlan entry
//   const newPurchase = await PurchasedPlan.create({
//     userId,
//     userModel,
//     packageId,
//     purchasedByRole: user.role,
//     purchasedById: user._id,
//     amountPaid,
//     paymentMethod,
//     purchaseDate: new Date(),
//     startDate: start,
//     expiryDate: expiry,
//     status: "active",
//     remarks
//   });

//   successResponse(res, "Plan purchased successfully", newPurchase);
// });


const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");
const PurchasedPlan = require("../../../models/purchasedPlan");
const Package = require("../../../models/package");
const User = require("../../../models/user");
const WalletHistory = require("../../../models/userWalletHistory"); // Wallet history model

exports.createPurchasedPlan = catchAsync(async (req, res, next) => {
  const user = req.user; // Authenticated purchaser (Admin / Reseller / Lco)
  const {
    userId,
    userModel = "User",
    packageId,
    amountPaid,
    paymentMethod,
    startDate,
    remarks,
    isPaymentRecived
  } = req.body;

  if (!userId || !packageId || !amountPaid) {
    return next(new AppError("userId, packageId and amountPaid are required", 400));
  }

  // ---------------- CHECK PACKAGE ---------------- //
  const selectedPackage = await Package.findById(packageId);
  if (!selectedPackage) return next(new AppError("Package not found", 404));

  //=============================================//
  // Calculate validity period

  


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

  // ---------------- CREATE PURCHASED PLAN ---------------- //
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

  // ---------------- WALLET HISTORY HANDLING ---------------- //
  const purchaserId = user._id;
  const purchaserRole = user.role;

  // Get last wallet history for this user (to get opening balance)
  const lastHistory = await WalletHistory.findOne({ userId }).sort({ createdAt: -1 });
  const openingBalance = lastHistory ? lastHistory.closingBalance : 0;

  const transferBalance = packagePrice; // Plan price stored in transferBalance
  let closingBalance = openingBalance;

  if (!isPaymentRecived) {
    // Payment NOT received → minus entry
    closingBalance = openingBalance - packagePrice;
  } else {
    // Payment received → balance remains same
    closingBalance = openingBalance;
  }

  await WalletHistory.create({
    userId,
    purchaserId,
    purchaserRole,
    packageId,
    purchasedPlanId: newPurchase._id,
    openingBalance,
    transferBalance,
    closingBalance,
    isPaymentRecived: !!isPaymentRecived
  });

  // ---------------- RESPONSE ---------------- //
  successResponse(res, "Plan purchased successfully", newPurchase);
});
