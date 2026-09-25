require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const Pool = require("../src/models/pools");
const Zone = require("../src/models/zone");

async function checkPools() {
  await mongoose.connect(process.env.DB_URL);
  const pools = await Pool.find().populate("zone").lean();
  console.log("MongoDB Pools:", JSON.stringify(pools, null, 2));
  const zones = await Zone.find().lean();
  console.log("MongoDB Zones:", zones.map(z => ({ _id: z._id, name: z.name, zoneName: z.zoneName, ipacctZoneId: z.ipacctZoneId })));
  await mongoose.disconnect();
}

checkPools();
