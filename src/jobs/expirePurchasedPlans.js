const cron = require("node-cron");
const PurchasedPlan = require("../models/purchasedPlan");
const WalletHistory = require("../models/userWalletHistory");

const expirePurchasedPlans = async () => {
  const now = new Date();

  try {
    console.log("[CRON] 🔁 Checking for expired plans & auto-renew...");

    // Get only active plans
    const plans = await PurchasedPlan.find({ status: "active" })
      .populate("userId", "isAutoRecharge walletBalance")
      .populate("packageId", "validity basePrice offerPrice");
      

    if (plans.length === 0) {
      console.log("[CRON] ⏳ No active plans found to process");
      return;
    }

    for (const plan of plans) {
      const user = plan.userId;
      const pkg = plan.packageId;

      if (!user || !pkg || !pkg.validity) {
        console.warn(`[CRON] Skipping invalid plan ${plan._id} — missing user/package/validity`);
        continue;
      }

      // Determine effective expiry date
      let effectiveExpiry = plan.expiryDate;

      if (plan.renewals?.length > 0) {
        // Use the LATEST expiry from all renewals
        const renewalDates = plan.renewals
          .map(r => new Date(r.newExpiryDate))
          .filter(date => !isNaN(date.getTime()));

        if (renewalDates.length > 0) {
          effectiveExpiry = new Date(Math.max(...renewalDates));
        }
      }

      if (isNaN(effectiveExpiry.getTime())) {
        console.error(`[CRON] ❌ Invalid effective expiry for plan ${plan._id} → expiring`);
        plan.status = "expired";
        await plan.save();
        continue;
      }

      // Still valid → skip this plan
      if (effectiveExpiry > now) {
        continue;
      }

      console.log(
        `[CRON] ⏰ Plan ${plan._id} is expired | User ${user._id} | ` +
        `Effective expiry was: ${effectiveExpiry.toISOString()}`
      );

      // Check if the plan has renewals
      if (plan.isRenewed) {
        const pendingRenewals = plan.renewals.filter(r => r.status === "pending");
        if (pendingRenewals.length > 0) {
          const nextRenewal = pendingRenewals[0]; // Activate the first pending renewal
          plan.expiryDate = new Date(nextRenewal.newExpiryDate);
          nextRenewal.status = "active";
          plan.isRenewed = true;
          await plan.save();
          console.log(`[CRON] Activated pending renewal for plan ${plan._id}`);
          continue;
        }
      }

      // Check for advance renewals
      const pendingAdvances = await PurchasedPlan.find({
        userId: plan.userId,
        packageId: plan.packageId,
        status: "pending",
        advanceRenewal: true
      }).sort({ purchaseDate: 1 });

      let baseExpiry = plan.expiryDate;
      for (const adv of pendingAdvances) {
        const validityNumber = Number(adv.packageId.validity.number);
        const validityUnit = (adv.packageId.validity.unit || "").toLowerCase();
        let newExpiryDate = new Date(baseExpiry);
        switch (validityUnit) {
          case "day": newExpiryDate.setDate(newExpiryDate.getDate() + validityNumber); break;
          case "week": newExpiryDate.setDate(newExpiryDate.getDate() + validityNumber * 7); break;
          case "month": newExpiryDate.setMonth(newExpiryDate.getMonth() + validityNumber); break;
          case "year": newExpiryDate.setFullYear(newExpiryDate.getFullYear() + validityNumber); break;
        }
        plan.renewals.push({
          renewedOn: new Date(),
          previousExpiryDate: baseExpiry,
          newExpiryDate,
          amountPaid: adv.amountPaid,
          paymentMethod: adv.paymentMethod,
          paymentDetails: adv.paymentDetails,
          status: "active",
          isPaymentReceived: adv.isPaymentReceived,
          remarks: "Advance renewal merged"
        });
        baseExpiry = newExpiryDate;
        adv.status = "expired";
        adv.advanceRenewal = false;
        await adv.save();
        console.log(`[CRON] Advance renewal merged for plan ${plan._id}, advance ${adv._id}`);
      }
      plan.expiryDate = baseExpiry;

      // Check for auto-recharge
      if (user.isAutoRecharge) {
        const validityNumber = Number(pkg.validity.number);
        const validityUnit = (pkg.validity.unit || "").toLowerCase();

        if (
          !validityNumber ||
          validityNumber <= 0 ||
          !["day", "week", "month", "year"].includes(validityUnit)
        ) {
          console.error(`[CRON] ❌ Invalid validity config for ${plan._id} → expiring`);
          plan.status = "expired";
          await plan.save();
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
        }

        const packagePrice = pkg.basePrice || pkg.offerPrice || 0;
        const walletDeduction = Math.max(packagePrice, 0);

        if (walletDeduction > 0) {
          user.walletBalance = Number(user.walletBalance || 0) - walletDeduction;
          await user.save();

          await WalletHistory.create({
            userId: user._id,
            amount: walletDeduction,
            type: "debit",
            remark: "Auto-recharge deduction",
            createdAt: now,
          });

          console.log(`[CRON] Wallet updated for user ${user._id}, amount deducted: ${walletDeduction}`);
        }

        plan.renewals.push({
          renewedOn: now,
          previousExpiryDate: effectiveExpiry,
          newExpiryDate,
          amountPaid: packagePrice,
          paymentMethod: "Wallet",
          remarks: "Auto-renew via cron",
        });

        plan.expiryDate = newExpiryDate;
        plan.status = "active";
        plan.isRenewed = true;

        await plan.save();

        console.log(
          `[CRON] ✅ Auto-renewed | Plan ${plan._id} | User ${user._id} | ` +
          `New expiry: ${newExpiryDate.toISOString()}`
        );
        continue;
      }

      // Expire the plan if no renewals or auto-recharge
      plan.status = "expired";
      await plan.save();
      console.log(`[CRON] Expired plan ${plan._id}`);
    }

    console.log("[CRON] ✅ Completed expire & auto-renew check");
  } catch (error) {
    console.error("[CRON] ❌ Error in expirePurchasedPlans:", error.message);
  }
};


// Schedule – every 1 minute (your original setting)
const scheduleExpirePlansJob = () => {
  console.log("[CRON] ⏰ Scheduling expirePurchasedPlans job to run every 1 minute");
  cron.schedule("*/1 * * * *", async () => {
    console.log("[CRON] 🔁 Starting expire & auto-renew check...");
    await expirePurchasedPlans();
    // await advanceRenewals();
  });
};

module.exports = scheduleExpirePlansJob;