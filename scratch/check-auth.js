const { callSoap } = require("../src/utils/soapApi");
const dotenv = require("dotenv");
dotenv.config();

async function checkAuth() {
  try {
    const params = {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS,
      luser: process.env.IPACCT_USER,
      lpass: process.env.IPACCT_PASS,
      ip: "127.0.0.1"
    };

    console.log("Checking Admin Login...");
    const res = await callSoap("ipbillCheckAdminLogin", params);
    console.log("Response:", JSON.stringify(res, null, 2));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkAuth();
