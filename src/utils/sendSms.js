const axios = require("axios");

const sendSMS = async (mobile, message) => {
  try {

    const response = await axios.get(
      "http://osd7.in/V2/http-api.php",
      {
        params: {
          apikey: process.env.SMS_API_KEY,
          senderid: "NETWAY",
          number: mobile,
          message: message,
          format: "json"
        }
      }
    );

    console.log("SMS Provider Response:", response.data);

    return response.data;

  } catch (error) {
    console.log(error.response?.data || error.message);
  }
};

module.exports = { sendSMS };


