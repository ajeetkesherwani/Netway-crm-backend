const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const { addIpacctUser } = require("../src/services/ipacctUserServices");

async function test() {
  const dummyUserData = {
    name: "Test User Antigravity",
    address: "Noida Sector 62",
    pin: "201301",
    phone: "9876543210",
    mobile: "9876543210",
    username: "TESTUSER" + Math.floor(1000 + Math.random() * 9000),
    password: "Password@123",
    email: "testuser@example.com",
    packageId: 1,
    packageName: "Test Package",
    fee: "500",
    expiryDate: new Date(),
    zoneid: 1,
    zonename: "TEST",
    ipAdress: "", // dynamic IP user
    poolId: 1
  };

  console.log("Calling addIpacctUser with empty ipAdress...");
  const res = await addIpacctUser(dummyUserData);
  console.log("RESULT RETURNED FROM addIpacctUser:", JSON.stringify(res, null, 2));

  if (res && res.return) {
    const ret = res.return;
    const ipacctId = typeof ret.id === "object" ? (ret.id._ || ret.id) : ret.id;
    const ipacctCid = typeof ret.cid === "object" ? (ret.cid._ || ret.cid) : ret.cid;
    console.log(`SUCCESS! ipacctId=${ipacctId}, ipacctCid=${ipacctCid}`);
  }
}

test();
