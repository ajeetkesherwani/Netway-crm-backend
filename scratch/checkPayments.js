const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });

const dbUrl = (process.env.DB_URL || "").trim().replace(/^['"]|['"]$/g, "");

async function run() {
  await mongoose.connect(dbUrl);
  const PlanPayment = require("./src/models/planPayment");
  const list = await PlanPayment.find().sort({ createdAt: -1 }).limit(5).lean();
  console.log("Recent PlanPayments:", JSON.stringify(list, null, 2));
  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

