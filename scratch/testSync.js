require("dotenv").config({ path: "config.env" });
const { callSoap } = require("../src/utils/soapApi");

async function test() {
  try {
    const params = {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS,
      cid: 8,
      expdate: "2026-10-25",
      expdateisnull: "false"
    };

    const customOpts = {
      endpoint: "https://139.5.198.58:443/0/bgpost", 
      namespace: "urn:IPACCTipacct",
      tns: "urn:IPACCTipacct"
    };
    
    console.log("Calling setClientExpDate on .58 bgpost...");
    const updateRes = await callSoap("setClientExpDate", params, "", customOpts);
    console.log("Update response:", JSON.stringify(updateRes, null, 2));
    
  } catch (err) {
    console.error(err);
  }
}

test();
