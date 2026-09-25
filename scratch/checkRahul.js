require("dotenv").config({ path: "./config.env" });
const { callSoap } = require("../src/utils/soapApi");
const { getIpacctUser } = require("../src/services/ipacctUserServices");

async function checkRahul() {
  const customOpts59 = {
    endpoint: "https://139.5.198.59:443/0/api",
    namespace: "urn:IPACCTipacct",
    tns: "urn:IPACCTipacct"
  };

  const user = process.env.IPACCT_API_USER || "admin";
  const pass = process.env.IPACCT_API_PASS || "sm@rtw@y";

  // Check user 68
  const res = await callSoap("getUser", {
    user,
    pass,
    id: 68
  }, "", customOpts59);

  console.log("Rahul getUser on .59:", JSON.stringify(res, null, 2));
}

checkRahul();
