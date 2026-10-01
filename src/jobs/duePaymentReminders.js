const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load config
dotenv.config({ path: path.join(__dirname, "../../config.env") });

const User = require("../models/user");
const { sendWhatsappNotification } = require("../services/whatsappService");

const sendDuePaymentReminders = async () => {
  try {
    console.log("[JOB] 📣 Running Due Payment Reminders...");

    // Find all users with a negative wallet balance (meaning they have due payment)
    const usersWithDue = await User.find({
      walletBalance: { $lt: 0 },
      status: { $ne: "Terminated" }
    }).select("generalInformation.phone phone walletBalance generalInformation.name generalInformation.username");

    console.log(`[JOB] Found ${usersWithDue.length} users with due payment. Sending reminders...`);

    if (usersWithDue.length === 0) return;

    for (const user of usersWithDue) {
      const mobile = user?.generalInformation?.phone || user?.phone;
      const name = user?.generalInformation?.name || "Unknown";
      const username = user?.generalInformation?.username || "Unknown";

      if (mobile) {
        const dueAmount = Math.abs(user.walletBalance);
        
        // Use a small delay between messages to avoid hitting WhatsApp API rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

        // Sending a dummy link in button_params for testing
        const paymentLink = "https://netwayinternet.com/pay"; 
        
        sendWhatsappNotification(String(mobile), "reminder", [String(dueAmount)], [], [paymentLink])
          .then(() => {
            console.log(`[WhatsApp] ✅ Sent reminder to: Name: ${name}, Username: ${username}, Mobile: ${mobile}, Due: Rs. ${dueAmount}`);
          })
          .catch(err => {
            console.error(`[WhatsApp] ❌ Failed to send reminder to ${name} (${mobile}):`, err.message);
          });
      }
    }

    console.log("[JOB] ✅ Completed Due Payment Reminders");
  } catch (error) {
    console.error("[JOB] ❌ Error in sendDuePaymentReminders:", error.message);
  }
};

module.exports = sendDuePaymentReminders;

// Allow running the script directly
if (require.main === module) {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    console.error("DB_URL is not defined in config.env");
    process.exit(1);
  }

  mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(async () => {
    console.log("DB connected");
    await sendDuePaymentReminders();
    process.exit(0);
  }).catch(err => {
    console.error("DB connection error:", err);
    process.exit(1);
  });
}
