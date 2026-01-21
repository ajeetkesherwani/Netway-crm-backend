// const axios = require("axios");

// const sendSMS = async (mobile, message) => {
//   const url = "https://www.bulksmsindia.app/V2/http-api.php";

//   const response = await axios.get(url, {
//     params: {
//       apikey: process.env.SMS_API_KEY,
//       senderid: "NETWAY",
//       number: mobile,
//       message,
//       format: "json"
//     }
//   });

// console.log("response", response);  

//   console.log("SMS API response:", response.data);
//   return response.data;
// };

// module.exports = { sendSMS };
