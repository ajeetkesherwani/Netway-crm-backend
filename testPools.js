require('dotenv').config({ path: 'c:\\tekniko_backend\\Netway-crm-backend\\config.env' });
const { callSoap } = require('./src/utils/soapApi');

async function testGetPools() {
  const params = {
    user: process.env.IPACCT_USER,
    pass: process.env.IPACCT_PASS,
    ipacctid: "1",
    zoneid: "1"
  };
  const customOpts = {
    namespace: "urn:IPACCTipacct",
    tns: "urn:IPACCTipacct"
  };

  const response = await callSoap("ipbillGetPools", params, "", customOpts);
  console.log("FINAL PARSED RESPONSE:", JSON.stringify(response, null, 2));
}

testGetPools();
