const User = require("../../../models/user");
const AddUserWallet = require("../../../models/AddUserWallet");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { sendWhatsappNotification } = require("../../../services/whatsappService");
const { createLog } = require("../../../utils/userLogActivity");

exports.addUserWalletPayment = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const {
    amountToBePaid,
    paymentMode,
    transactionNo,
    comments,
    fullPaid,
    sms,
  } = req.body;

  if (!userId || !paymentMode) {
    return next(new AppError("Required fields missing", 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const currentBalance = Number(user.walletBalance || 0);
  const currentCreditBalance = Number(user.creditBalance || 0);

  let paidAmount = 0; 

  // FULL PAID → only clears negative dues
  if (fullPaid === true || fullPaid === "true") {
    if (currentBalance >= 0) {
      return next(new AppError("No due to clear for this user", 400));
    }
    paidAmount = Math.abs(currentBalance);
  }
  // NORMAL PAYMENT (can be any amount)
  else {
    if (!amountToBePaid || Number(amountToBePaid) <= 0) {
      return next(new AppError("Invalid amount to be paid", 400));
    }
    paidAmount = Number(amountToBePaid);
  }

  //   LOGIC 
  const newWalletBalance = currentBalance + paidAmount;
  const customerDisplayName = user.generalInformation?.name || userId;
  const customerEmail = user.generalInformation?.email || "Not provided";
  const customerPhone = user.generalInformation?.phone || "Not provided";
  const billingAddress = user.addressDetails?.billingAddress || {};
  const billingAddressText = [
    billingAddress.addressine1,
    billingAddress.addressine2,
    billingAddress.city,
    billingAddress.state,
    billingAddress.pincode,
  ].filter(Boolean).join(", ");
  const recordedByName =
    req.user?.name || req.user?.adminName || req.user?.role || "Unknown";

  // CREDIT BALANCE RULE
  const creditBalance = newWalletBalance > 0 ? newWalletBalance : 0;

  // Save user
  user.walletBalance = newWalletBalance;
  user.creditBalance = creditBalance;
  await user.save();

  // Image proof
  let imageProof = "";
  if (req.files?.imageProof?.length > 0) {
    imageProof = req.files.imageProof[0].path;
  }

  // Save history
  const payment = await AddUserWallet.create({
    userId,
    totalAmount: currentBalance,
    amountToBePaid: paidAmount,
    dueAmount: newWalletBalance,
    creditBalance,
    fullPaid: fullPaid === true || fullPaid === "true",
    paymentMode,
    transactionNo,
    comments,
    imageProof,
    sms: sms === true || sms === "true",
  });

  await createLog({
    userId: user._id,
    type: "Wallet Payment Added",
    description: [
      `Wallet payment credited successfully for ${customerDisplayName}`,
      `Email: ${customerEmail}`,
      `Phone: ${customerPhone}`,
      `Billing address: ${billingAddressText || "Not provided"}`,
      `Amount: ${paidAmount}`,
      `Previous balance: ${currentBalance}`,
      `New balance: ${newWalletBalance}`,
      `Payment mode: ${paymentMode}`,
      `Recorded by: ${recordedByName}`,
    ].join(". "),
    details: {
      paymentId: payment._id,
      customerId: user._id,
      customerName: customerDisplayName,
      customerEmail,
      customerPhone,
      billingAddress,
      amountPaid: paidAmount,
      direction: "credit",
      balanceChange: newWalletBalance - currentBalance,
      paymentMode,
      transactionNo,
      previousWalletBalance: currentBalance,
      newWalletBalance,
      previousCreditBalance: currentCreditBalance,
      creditBalance,
      newCreditBalance: creditBalance,
      fullyPaid: fullPaid === true || fullPaid === "true",
      recordedById: req.user._id,
      recordedByRole: req.user.role,
      recordedByName,
    },
    addedBy: {
      id: req.user._id,
      role: req.user.role || "Admin",
      name: recordedByName,
    },
    ip: req.ip || req.headers["x-forwarded-for"],
    module: "wallet",
    targetType: "walletPayment",
    targetId: payment._id,
    targetName: user.generalInformation?.name,
  });

  // --- Send WhatsApp Notification ---
  const phone = user.generalInformation?.phone || user.generalInformation?.mobile || user.phone;
  const customerName = user.generalInformation?.name || "Customer";
  if (phone) {
    sendWhatsappNotification(phone, "add_payment1", [customerName, String(paidAmount)])
      .catch(err => console.error("[WhatsApp] Notification failed in addPayment:", err.message));
  }

  res.status(200).json({
    status: true,
    message: "Wallet updated successfully",
    walletBalance: newWalletBalance,
    creditBalance,
    payment,
  });
});
