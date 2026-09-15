const { callSoap } = require("../src/utils/soapApi");
const dotenv = require("dotenv");
dotenv.config();

async function checkUser(username) {
  try {
    console.log("Checking for user:", username);
    const params = {
      user: process.env.IPACCT_USER,
      pass: process.env.IPACCT_PASS,
      search: username
    };
    const response = await callSoap("ipbillSearch", params);
    console.log("Search Result:", JSON.stringify(response, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkUser("ARYA6555");
