require("dotenv").config({ path: "./config.env" });
const { addIpacctUser, getIpacctUser } = require("../src/services/ipacctUserServices");

async function run() {
  const username = "testpooluser_" + Math.floor(Math.random() * 10000);
  const res = await addIpacctUser({
    name: username,
    username: username,
    password: "password123",
    packageId: 1,
    packageName: "TEST 1000 Mbps",
    zoneid: 3,
    zonename: "NOIDA",
    poolId: "2",
    poolName: "NOIDA-POOL",
    ipAdress: ""
  });
  console.log("addIpacctUser returned:", JSON.stringify(res, null, 2));

  if (res?.return?.id) {
    const id = typeof res.return.id === 'object' ? res.return.id._ : res.return.id;
    console.log("Fetching created user ID:", id);
    const u = await getIpacctUser(id);
    console.log("Created user pools & ips:", JSON.stringify(u?.userData?.ips, null, 2));
  }
}

run();
