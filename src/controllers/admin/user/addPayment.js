const User = require("../../../models/user");
const AddUserWallet = require("../../../models/AddUserWallet");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { sendWhatsappNotification } = require("../../../services/whatsappService");

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
