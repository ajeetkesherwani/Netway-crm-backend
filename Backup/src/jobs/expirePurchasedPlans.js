// jobs/expirePurchasedPlans.js
const cron = require("node-cron");
const PurchasedPlan = require("../models/purchasedPlan");
const mongoose = require("mongoose");

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
    expirePurchasedPlans();
  });
};

module.exports = scheduleExpirePlansJob;
