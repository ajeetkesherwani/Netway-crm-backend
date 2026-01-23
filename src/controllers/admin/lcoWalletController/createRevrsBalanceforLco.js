const Lco = require("../../../models/lco");
const Reseller = require("../../../models/retailer");
const LcoWalletHistory = require("../../../models/lcoWalletHistory");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.reverseLcoWalletTransfer = catchAsync(async (req, res, next) => {
  const { lcoId, amount, transferDate, remark } = req.body;

  if (!lcoId) return next(new AppError("LcoId is required", 400));
    if (!amount || Number(amount) <= 0) {
  return next(new AppError("Amount must be greater than 0", 400));
}
  if (!transferDate) return next(new AppError("TransferDate is required", 400));

  const lco = await Lco.findById(lcoId).populate({
    path: "retailerId",
    select: "_id resellerName walletBalance"
  });

  if (!lco) return next(new AppError("LCO not found", 404));

  const reseller = lco.retailerId;
  if (!reseller) return next(new AppError("Reseller not found for this LCO", 404));

  // LCO must have balance to reverse
  if ((lco.walletBalance || 0) < amount) {
    return next(
      new AppError("Insufficient LCO wallet balance to reverse this transfer", 400)
    );
  }

  // ===============================
  // WALLET REVERSAL
  // ===============================

  const lcoOpening = lco.walletBalance || 0;
  const resellerOpening = reseller.walletBalance || 0;

  // Deduct from LCO
  lco.walletBalance = lcoOpening - amount;
  await lco.save();

  // Add back to reseller
  reseller.walletBalance = resellerOpening + amount;
  await reseller.save();

  // LCO Wallet History (Reverse Entry)
  const walletHistory = await LcoWalletHistory.create({
    lco: lco._id,
    reseller: reseller._id,
    amount,
    transferDate,
    mode: "Reverse",
    remark: remark || "Wallet reversal",
    isReverse: true,
    createdBy: req.user.role,      
    createdById: req.user._id,
    openingBalance: lcoOpening,
    closingBalance: lco.walletBalance
  });

  successResponse(res, "Wallet reversal successful", {
    walletHistory,
    lcoWalletBalance: lco.walletBalance,
    reseller: {
      id: reseller._id,
      name: reseller.resellerName,
      walletBalance: reseller.walletBalance
    }
  });
});
