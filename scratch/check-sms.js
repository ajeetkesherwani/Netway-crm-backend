const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

async function checkSms() {
  try {
    // Check balance
    const res = await axios.get("http://osd7.in/V2/http-api.php", {
      params: {
        apikey: process.env.SMS_API_KEY,
        balance: 1,
        format: "json"
      }
    });
    console.log("SMS Balance / Info Response:", res.data);
  } catch (err) {
    console.error("SMS Error:", err.response?.data || err.message);
  }
}

checkSms();
