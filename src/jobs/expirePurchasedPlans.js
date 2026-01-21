const cron = require("node-cron");
const PurchasedPlan = require("../models/purchasedPlan");

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


      // Determine effective (current real) expiry date

      let effectiveExpiry = plan.expiryDate;

      if (plan.renewals?.length > 0) {
        // Use the LATEST  expiry from all renewals
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

      // Find all pending advance renewals for this user/package, ordered by purchaseDate
      const pendingAdvances = await PurchasedPlan.find({
        userId: plan.userId,
        packageId: plan.packageId,
        status: "pending",
        advanceRenewal: true
      }).sort({ purchaseDate: 1 });

      let baseExpiry = plan.expiryDate;
      for (const adv of pendingAdvances) {
        // Only merge if not already merged
        const validityNumber = Number(adv.packageId.validity.number);
        const validityUnit = (adv.packageId.validity.unit || "").toLowerCase();
        let newExpiryDate = new Date(baseExpiry);
        switch (validityUnit) {
          case "day": newExpiryDate.setDate(newExpiryDate.getDate() + validityNumber); break;
          case "week": newExpiryDate.setDate(newExpiryDate.getDate() + validityNumber * 7); break;
          case "month": newExpiryDate.setMonth(newExpiryDate.getMonth() + validityNumber); break;
          case "year": newExpiryDate.setFullYear(newExpiryDate.getFullYear() + validityNumber); break;
        }
        // Add a renewal entry
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
        // Mark advance renewal as merged
        adv.status = "expired";
        adv.advanceRenewal = false;
        await adv.save();
        console.log(`[CRON] Advance renewal merged for plan ${plan._id}, advance ${adv._id}`);
      }
      // Update the plan's expiryDate after all merges
      plan.expiryDate = baseExpiry;

      // No auto-recharge → expire the plan
      if (!user.isAutoRecharge) {
        plan.status = "expired";
        await plan.save();
        console.log(`[CRON] Expired (no auto-recharge) → ${plan._id}`);
        continue;
      }

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

      // Calculate new expiry date
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

      if (isNaN(newExpiryDate.getTime())) {
        console.error(`[CRON] ❌ Failed to calculate new expiry for ${plan._id} → expiring`);
        plan.status = "expired";
        await plan.save();
        continue;
      }

      // ─── Payment & Wallet logic
      const packagePrice = renewalAmount;

      const paidAmount =
        plan.isPaymentReceived === true
          ? Number(plan.paymentDetails?.amount || 0)
          : 0;

      const walletDeduction = Math.max(packagePrice - paidAmount, 0);

      if (walletDeduction > 0) {
        user.walletBalance = Number(user.walletBalance || 0) - walletDeduction;
        await user.save();
      }

      const renewalPaymentDetails =
        paidAmount > 0
          ? {
            date: plan.paymentDetails?.date || now,
            method: plan.paymentDetails?.method || "Online",
            amount: paidAmount,
            remark:
              paidAmount === packagePrice
                ? "Auto-renew full payment received"
                : "Auto-renew partial payment received",
          }
          : null;

      // Add the renewal record
      plan.renewals.push({
        renewedOn: now,
        previousExpiryDate: effectiveExpiry,
        newExpiryDate,
        amountPaid: packagePrice,
        paymentMethod: paidAmount > 0 ? "Online" : "Wallet",
        paymentDetails: renewalPaymentDetails,
        remarks: "Auto-renew via cron",
      });

      // Update main plan document
      plan.expiryDate = newExpiryDate;
      plan.status = "active";
      plan.isRenewed = true;
      plan.isPaymentReceived = paidAmount > 0;

      await plan.save();

      console.log(
        `[CRON] ✅ Auto-renewed | Plan ${plan._id} | User ${user._id} | ` +
        `New expiry: ${newExpiryDate.toISOString()}`
      );
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