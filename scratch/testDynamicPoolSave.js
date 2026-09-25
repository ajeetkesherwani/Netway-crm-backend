require("dotenv").config({ path: "./config.env" });
const { addIpacctUser, getIpacctUser } = require("../src/services/ipacctUserServices");

async function testDynamicPool() {
  const username = "dynpool_" + Math.floor(Math.random() * 10000);
  console.log("Creating user with pool: '2', empty ipAddress, zoneid: 3");

  const res = await addIpacctUser({
    name: username,
    username: username,
    password: "password123",
    packageId: 1,
    packageName: "TEST 1000 Mbps",
    zoneid: 3,
    zonename: "NOIDA",
    poolId: "2", // Frontend sends "2"
    ipAdress: "" // Frontend sends ""
  });

  console.log("addIpacctUser response:", JSON.stringify(res, null, 2));

  if (res?.return?.id) {
    const id = typeof res.return.id === 'object' ? res.return.id._ : res.return.id;
    console.log("Fetching created user from IPACCT:", id);
    const u = await getIpacctUser(id);
    console.log("Saved User Data on IPACCT:");
    console.log("Name:", u.userData?.name);
    console.log("Zone:", u.userData?.zoneid, u.userData?.zonename);
    console.log("Pools:", JSON.stringify(u.userData?.ips?.item?.pools || u.userData?.ips, null, 2));
    console.log("Allocated IP:", u.userData?.ips?.item?.ip);
  }
}

testDynamicPool();
