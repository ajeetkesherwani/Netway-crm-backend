require("dotenv").config({ path: "./config.env" });
const { addIpacctUser, listIpacctUsers } = require("../src/services/ipacctUserServices");

async function testExactIp() {
  const enteredIp = "139.5.198.16";
  const username = "exact_ip_user_" + Math.floor(Math.random() * 1000);

  console.log(`Testing with user-entered IP: "${enteredIp}", poolId: "1", zoneid: 1`);

  const res = await addIpacctUser({
    name: username,
    username: username,
    password: "password123",
    packageId: 1,
    packageName: "TEST 1000 Mbps",
    zoneid: 1,
    zonename: "TEST",
    poolId: "1",
    ipAdress: enteredIp
  });

  console.log("addIpacctUser response:", JSON.stringify(res, null, 2));

  const listRes = await listIpacctUsers({ search: username });
  const savedUser = listRes.users[0];

  console.log("\n=== VERIFICATION IN IPACCT ===");
  console.log("User ID:", savedUser?.id);
  console.log("Name:", savedUser?.name);
  console.log("Saved IP in IPACCT:", savedUser?.ips?.item?.ip);
  console.log("Saved staticip in IPACCT:", savedUser?.ips?.item?.staticip);
  console.log("Is IP exactly entered IP?", savedUser?.ips?.item?.ip === enteredIp);
}

testExactIp();
