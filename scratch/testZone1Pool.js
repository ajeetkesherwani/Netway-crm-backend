require("dotenv").config({ path: "./config.env" });
const { addIpacctUser, listIpacctUsers } = require("../src/services/ipacctUserServices");

async function testZone1Pool() {
  const username = "testpool_z1_" + Math.floor(Math.random() * 10000);
  console.log("Creating user with pool: '1', empty ipAddress, zoneid: 1");

  const res = await addIpacctUser({
    name: username,
    username: username,
    password: "password123",
    packageId: 1,
    packageName: "TEST 1000 Mbps",
    zoneid: 1,
    zonename: "TEST",
    poolId: "1",
    ipAdress: ""
  });

  console.log("addIpacctUser response:", JSON.stringify(res, null, 2));

  const list = await listIpacctUsers({ search: username });
  console.log("SAVED USER 1 ON IPACCT:", JSON.stringify(list.users[0]?.ips, null, 2));
}

testZone1Pool();
