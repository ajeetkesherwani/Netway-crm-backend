const axios = require("axios");

async function testEndpoint() {
  try {
    const res = await axios.post("http://127.0.0.1:3000/api/admin/common/test-sms", {
      mobile: "7383632575",
      templateName: "your account has been created",
      variables: {
        plan: "TEST 1000 Mbps",
        username: "PRADEEP016349",
        password: "123456"
      }
    });
    console.log("Endpoint test response:", res.data);
  } catch (err) {
    console.log("Response / Error on 3000:", err.message);
  }
}

testEndpoint();
