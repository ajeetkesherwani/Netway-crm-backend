// jobs/expirePurchasedPlans.js
const cron = require("node-cron");
const PurchasedPlan = require("../models/purchasedPlan");
const User = require("../models/user");
const mongoose = require("mongoose");

//  Check renewed plans and expire ONLY if latest renewal is expired
const expireRenewalPlans = async () => {
  const now = new Date();

  try {
    const plans = await PurchasedPlan.find({
      isRenewed: true,
      renewals: { $exists: true, $ne: [] }
    });

    for (const plan of plans) {
      const latestRenewal = plan.renewals[plan.renewals.length - 1];

      if (latestRenewal.newExpiryDate <= now) {
        plan.status = "expired";
        await plan.save();
      }
    }
  } catch (error) {
    console.error("[CRON] ❌ Error in expireRenewalPlans:", error.message);
  }
};


//  Auto-renew plan if user has isAutoRecharge = true
const autoRenewPlans = async () => {
  const now = new Date();

  try {
    console.log("[CRON] 🔁 Checking for expired plans...");

    const plans = await PurchasedPlan.find({ status: "active" })
      .populate("userId", "isAutoRecharge walletBalance")
      .populate("packageId", "validity basePrice offerPrice");

    // console.log("plans length:", plans);

    for (const plan of plans) {
      const user = plan.userId;
      const pkg = plan.packageId;

      if (!user || !pkg || !pkg.validity) continue;

      //Get effective expiry
      let effectiveExpiry = plan.expiryDate;

      if (plan.renewals?.length) {
        effectiveExpiry = new Date(
          plan.renewals[plan.renewals.length - 1].newExpiryDate
        );
      }

      if (isNaN(effectiveExpiry)) {
        console.error("[CRON] ❌ Invalid expiry date, skipping:", plan._id);
        continue;
      }

      // Not expired yet 
      if (effectiveExpiry > now) continue;

      console.log(`[CRON] ⏰ Expired | User ${user._id}`);

      // Auto-recharge OFF → expire
      if (!user.isAutoRecharge) {
        plan.status = "expired";
        await plan.save();
        continue;
      }

      // Renewal amount (REQUIRED)
      const renewalAmount =
        Number(pkg.basePrice) ||
        Number(pkg.offerPrice) ||
        Number(plan.amountPaid);

      if (!renewalAmount || renewalAmount <= 0) {
        console.error("[CRON] ❌ Invalid renewal amount:", plan._id);
        continue;
      }

      // Calculate new expiry date
      const validityNumber = Number(pkg.validity.number);
      const validityUnit = pkg.validity.unit.toLowerCase();

      if (!validityNumber || validityNumber <= 0) {
        console.error("[CRON] ❌ Invalid validity:", plan._id);
        continue;
      }

      const newExpiryDate = new Date(effectiveExpiry);

      switch (validityUnit) {
        case "day":
          newExpiryDate.setDate(newExpiryDate.getDate() + validityNumber);
          break;
        case "week":
          newExpiryDate.setDate(newExpiryDate.getDate() + validityNumber * 7);
          break;
        case "month":
          newExpiryDate.setMonth(newExpiryDate.getMonth() + validityNumber);
          break;
        case "year":
          newExpiryDate.setFullYear(newExpiryDate.getFullYear() + validityNumber);
          break;
        default:
          console.error("[CRON] ❌ Invalid validity unit:", validityUnit);
          continue;
      }

      if (isNaN(newExpiryDate)) {
        console.error("[CRON] ❌ New expiry invalid:", plan._id);
        continue;
      }

      // ================= PAYMENT & WALLET LOGIC =================

      // Full package price
      const packagePrice = renewalAmount;

      // How much user actually paid (0 / partial / full)
      const paidAmount =
        plan.isPaymentRecived === true
          ? Number(plan.paymentDetails?.amount || 0)
          : 0;

      // Wallet deduction = remaining amount
      const walletDeduction = Math.max(packagePrice - paidAmount, 0);

      // Deduct from wallet (negative allowed)
      if (walletDeduction > 0) {
        user.walletBalance = Number(user.walletBalance || 0) - walletDeduction;
        await user.save();
      }

      // Prepare paymentDetails ONLY if user paid
      const renewalPaymentDetails =
        paidAmount > 0
          ? {
            date: plan.paymentDetails?.date || now,
            method: plan.paymentDetails?.method || "Online",
            amount: paidAmount,
            remark:
              paidAmount === packagePrice
                ? "Auto-renew full payment received"
                : "Auto-renew partial payment received"
          }
          : null;

      // =========================================================


      // Push renewal entry
      plan.renewals.push({
        renewedOn: now,
        previousExpiryDate: effectiveExpiry,
        newExpiryDate,
        amountPaid: packagePrice,                 // REQUIRED
        paymentMethod: paidAmount > 0 ? "Online" : "Wallet",
        paymentDetails: renewalPaymentDetails,    // null OR object
        remarks: "Auto-renew via cron"
      });

      // Update plan
      plan.expiryDate = newExpiryDate;
      plan.status = "active";
      plan.isRenewed = true;



      plan.isPaymentRecived = paidAmount > 0;
      await plan.save();

      console.log(
        `[CRON] ✅ Auto-renewed | User ${user._id} | Expiry ${newExpiryDate}`
      );
    }

    console.log("[CRON] ✅ Auto-renew cron completed");
  } catch (error) {
    console.error("[CRON] ❌ Auto-renew error:", error);
  }
};

module.exports = autoRenewPlans;

//first time check expire plan
const expirePurchasedPlans = async () => {
  const now = new Date();

  try {
    const result = await PurchasedPlan.updateMany(
      {
        expiryDate: { $lte: now },
        status: { $ne: "expired" }
      },
      {
        $set: { status: "expired" }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[CRON] ✅ Expired ${result.modifiedCount} purchased plans at ${now.toISOString()}`);
    } else {
      console.log(`[CRON] ⏳ No plans to expire at ${now.toISOString()}`);
    }
  } catch (error) {
    console.error("[CRON] ❌ Error expiring plans:", error.message);
  }
};

// Schedule to run every 1 minute
const scheduleExpirePlansJob = () => {
  console.log("[CRON] ⏰ Scheduling expirePurchasedPlans job to run every 1 minute");
  cron.schedule("*/1 * * * *", () => {
    console.log("[CRON] 🔁 Checking for expired plans...");
    // expirePurchasedPlans();
    //  expireRenewalPlans();
    // autoRenewPlans();
  });
};

module.exports = scheduleExpirePlansJob;
