const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const Package = require("../models/package");
const PriceBook = require("../models/priceBook");
const PurchasedPlan = require("../models/purchasedPlan");
const UserPlanHistory = require("../models/userPlanHistory");
const { createHistory } = require("../utils/userPlanHistory");

const getPlanPrice = async (user, packageId) => {
  if (!mongoose.Types.ObjectId.isValid(packageId)) {
    throw new AppError("Invalid packageId", 400);
  }

  if (user.generalInformation?.createdFor?.type === "Admin") {
    const matchedPackage = await Package.findById(packageId).lean();
    if (!matchedPackage) throw new AppError("Package not found", 404);
    return { matchedPackage, amount: Number(matchedPackage.basePrice) };
  }

  const priceBook = await PriceBook.findOne({
    "package.packageId": packageId,
  }).lean();
  const matchedPackage = priceBook?.package?.find(
    (item) => item.packageId.toString() === packageId
  );
  if (!matchedPackage) throw new AppError("Package not found", 404);

  return {
    matchedPackage,
    amount: Number(matchedPackage.retailerPrice),
  };
};

const addPlanValidity = (date, validity) => {
  const expiryDate = new Date(date);
  const number = Number(validity?.number);
  if (!Number.isInteger(number) || number <= 0) {
    throw new AppError("Package validity is not configured correctly", 400);
  }

  switch (validity.unit) {
    case "Day":
      expiryDate.setDate(expiryDate.getDate() + number);
      break;
    case "Week":
      expiryDate.setDate(expiryDate.getDate() + number * 7);
      break;
    case "Month":
    case "Year": {
      const month = expiryDate.getMonth();
      const day = expiryDate.getDate();
      expiryDate.setDate(1);
      if (validity.unit === "Month") {
        expiryDate.setMonth(month + number);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + number);
        expiryDate.setMonth(month);
      }
      const lastDayOfMonth = new Date(
        expiryDate.getFullYear(),
        expiryDate.getMonth() + 1,
        0
      ).getDate();
      expiryDate.setDate(Math.min(day, lastDayOfMonth));
      break;
    }
    default:
      throw new AppError("Package validity unit is not supported", 400);
  }

  return expiryDate;
};

const activatePaidPlan = async ({
  userId,
  packageId,
  amount,
  orderId,
  validity,
}) => {
  let purchasedPlan = await PurchasedPlan.findOne({
    userId,
    packageId,
    $or: [
      { transactionId: orderId },
      { "renewals.transactionId": orderId },
    ],
  });

  if (!purchasedPlan) {
    purchasedPlan = await PurchasedPlan.findOne({ userId, packageId });
    const now = new Date();
    const previousExpiryDate = purchasedPlan?.expiryDate;
    const renewalStart =
      previousExpiryDate && previousExpiryDate > now ? previousExpiryDate : now;
    const newExpiryDate = addPlanValidity(renewalStart, validity);

    if (purchasedPlan) {
      purchasedPlan.renewals.push({
        previousExpiryDate,
        newExpiryDate,
        amountPaid: amount,
        transactionId: orderId,
        paymentMethod: "Online",
        renewedOn: now,
        isPaymentReceived: true,
        status: "active",
      });
      purchasedPlan.expiryDate = newExpiryDate;
      purchasedPlan.status = "active";
      purchasedPlan.isRenewed = true;
      purchasedPlan.isPaymentReceived = true;
      await purchasedPlan.save();
    } else {
      purchasedPlan = await PurchasedPlan.create({
        userId,
        packageId,
        amountPaid: amount,
        transactionId: orderId,
        purchasedByRole: "User",
        purchasedById: userId,
        paymentMethod: "Online",
        isPaymentReceived: true,
        expiryDate: newExpiryDate,
        status: "active",
        startDate: now,
      });
    }
  }

  const historyExists = await UserPlanHistory.exists({ transactionId: orderId });
  if (!historyExists) {
    const isRenewal = purchasedPlan.renewals.some(
      (renewal) => renewal.transactionId === orderId
    );
    await createHistory(
      userId,
      packageId,
      amount,
      isRenewal ? "renewal" : "purchase",
      "Online",
      orderId,
      ""
    );
  }

  return purchasedPlan;
};

module.exports = { getPlanPrice, activatePaidPlan };
