const { callSoap } = require("../src/utils/soapApi");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

async function search() {
  const params = {
    user: process.env.IPACCT_USER,
    pass: process.env.IPACCT_PASS,
    search: "100.64.40.2"
  };
  const res = await callSoap("ipbillSearch", params);
  console.log("Search by IP 100.64.40.2:", JSON.stringify(res, null, 2));

  const params2 = {
    user: process.env.IPACCT_USER,
    pass: process.env.IPACCT_PASS,
    search: "pradeep"
  };
  const res2 = await callSoap("ipbillSearch", params2);
  console.log("Search by pradeep:", JSON.stringify(res2, null, 2));
}

search();
