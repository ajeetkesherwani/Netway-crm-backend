const axios = require("axios");

const sendOTP = async (baseUrl) => {
  try {
    const response = await axios.get(baseUrl, {});
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error(err.response.data);
    return err;
  }
};
module.exports = sendOTP;
