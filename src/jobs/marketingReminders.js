const cron = require("node-cron");
const User = require("../models/user");
const PurchasedPlan = require("../models/purchasedPlan");
const { sendWhatsappNotification } = require("../services/whatsappService");

const sendMarketingReminders = async () => {
  try {
    console.log("[CRON] 📣 Running Marketing Reminders (3 times a day)...");

    // 1. Get all users who DO HAVE an active plan
    const activeUserIds = await PurchasedPlan.distinct("userId", { status: "active" });

    // 2. Find users who DO NOT have an active plan (excluding those completely Terminated)
    const usersWithoutPlan = await User.find({
      _id: { $nin: activeUserIds },
      status: { $ne: "Terminated" } 
    }).select("generalInformation.phone phone");

    console.log(`[CRON] Found ${usersWithoutPlan.length} users with NO active plan. Sending reminders...`);

    if (usersWithoutPlan.length === 0) return;

    for (const user of usersWithoutPlan) {
      const mobile = user?.generalInformation?.phone || user?.phone;
      if (mobile) {
        // Template expects an image in the header. Using a generic placeholder URL.
        const headerParams = ["https://dummyimage.com/600x400/000/fff&text=Netway+Internet"];
        
        // We use a small delay between messages to avoid hitting WhatsApp API rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

        sendWhatsappNotification(mobile, "after_recharge_complaint2", [], headerParams)
          .catch(err => console.error(`[WhatsApp] Failed to send marketing reminder to ${mobile}:`, err.message));
      }
    }

    console.log("[CRON] ✅ Completed Marketing Reminders");
  } catch (error) {
    console.error("[CRON] ❌ Error in marketingReminders:", error.message);
  }
};

// Schedule – exactly 3 times a day (9:00 AM, 2:00 PM, 7:00 PM)
const scheduleMarketingReminders = () => {
  console.log("[CRON] ⏰ Scheduling Marketing Reminders job to run 3 times a day (9 AM, 2 PM, 7 PM)");
  cron.schedule("0 9,14,19 * * *", async () => {
    await sendMarketingReminders();
  });
};

module.exports = scheduleMarketingReminders;
