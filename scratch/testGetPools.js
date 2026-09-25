require("dotenv").config({ path: "./config.env" });
const { callSoap } = require("../src/utils/soapApi");

async function testGetPools() {
  console.log("--- Testing .59 getPools ---");
  try {
    const res = await callSoap("getPools", {
      user: process.env.IPACCT_API_USER || "admin",
      pass: process.env.IPACCT_API_PASS || "sm@rtw@y",
      zoneid: ""
    }, "", {
      endpoint: "https://139.5.198.59:443/0/api",
      namespace: "urn:IPACCTipacct",
      tns: "urn:IPACCTipacct"
    });
    console.log("59 getPools res:", JSON.stringify(res).slice(0, 1000));
  } catch (e) {
    console.log("59 err:", e.message);
  }

  console.log("--- Testing .58 ipbillGetPools ---");
  try {
    const res = await callSoap("ipbillGetPools", {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS,
      ipacctid: "1",
      zoneid: ""
    }, "", {
      namespace: "urn:IPACCTipacct",
      tns: "urn:IPACCTipacct"
    });
    console.log("58 ipbillGetPools res:", JSON.stringify(res).slice(0, 1000));
  } catch (e) {
    console.log("58 err:", e.message);
  }
}

testGetPools();
