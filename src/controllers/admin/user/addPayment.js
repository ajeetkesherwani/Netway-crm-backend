const User = require("../../../models/user");
const AddUserWallet = require("../../../models/AddUserWallet");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

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

  // 1️⃣ Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const currentBalance = Number(user.walletBalance || 0);

  // 🔒 RULE: Admin cannot pay if no due
  if (currentBalance >= 0) {
    return next(new AppError("No outstanding due for this user", 400));
  }

  let paidAmount = 0;
  let newBalance = currentBalance;

  // 2️⃣ FULL PAID → clear dues only
  if (fullPaid === true || fullPaid === "true") {
    paidAmount = Math.abs(currentBalance);
    newBalance = 0;
  }
  // 3️⃣ PARTIAL PAYMENT
  else {
    if (!amountToBePaid || Number(amountToBePaid) <= 0) {
      return next(new AppError("Invalid amount to be paid", 400));
    }

    paidAmount = Number(amountToBePaid);
    newBalance = currentBalance + paidAmount;

    // 🔒 HARD STOP: never allow positive wallet
    if (newBalance > 0) {
      newBalance = 0;
    }
  }

  // 4️⃣ Update wallet balance
  user.walletBalance = newBalance;
  await user.save();

  // 5️⃣ Image upload
let imageProof = "";

if (req.files && req.files.imageProof && req.files.imageProof.length > 0) {
  imageProof = req.files.imageProof[0].path;
}
 

  // 6️⃣ Save history (audit-safe)
  const payment = await AddUserWallet.create({
    userId,
    totalAmount: currentBalance, // before payment (negative)
    amountToBePaid: paidAmount,
    dueAmount: newBalance,       // after payment (≤ 0)
    fullPaid: fullPaid === true || fullPaid === "true",
    paymentMode,
    transactionNo,
    comments,
    imageProof,
    sms: sms === true || sms === "true",
  });

  console.log("Payment recorded:", payment);

  res.status(200).json({
    status: true,
    message: "Payment recorded successfully",
    walletBalance: user.walletBalance,
    payment,
  });
});

