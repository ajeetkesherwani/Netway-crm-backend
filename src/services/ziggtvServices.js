const axios = require('axios');
require('dotenv').config({ path: 'config.env' }); // or whichever loads the env

const ZIGGTV_BASE_URL = "http://crm.ziggtv.com/partner/api";

function getZiggTvCredentials() {
  return {
    lcoCode: process.env.ZIGGTV_LCO_CODE,
    login_id: process.env.ZIGGTV_LOGIN_ID,
    api_token: process.env.ZIGGTV_API_TOKEN
  };
}

async function createZiggTvUser(user) {
  try {
    const creds = getZiggTvCredentials();
    const payload = {
      ...creds,
      phone: user.generalInformation?.phone || user.generalInformation?.mobile,
      name: user.generalInformation?.name || "Customer",
      email: user.generalInformation?.email || "customer@example.com",
      address: user.addressDetails?.billingAddress?.addressine1 || "N/A"
    };

    console.log("[ZiggTV] Calling create customer for", payload.phone);
    const response = await axios.post(`${ZIGGTV_BASE_URL}/customer/add`, payload);
    console.log("[ZiggTV] Create success:", response.data);
    let newCode = null;
    if (response.data && response.data.success && response.data.msg) {
      const match = response.data.msg.match(/New Subscriber Code is ([A-Z0-9]+)/i);
      if (match && match[1]) {
        newCode = match[1];
      }
    }
    return { ...response.data, subscriberCode: newCode };
  } catch (error) {
    console.error("[ZiggTV] Create customer error:", error.response?.data || error.message);
    throw error;
  }
}

async function assignZiggTvPack(user, planId) {
  try {
    // Attempt to create user first, ignoring errors if they already exist
    try {
      await createZiggTvUser(user);
    } catch (e) {
      console.log("[ZiggTV] User might already exist, continuing to assign pack.");
    }

    const creds = getZiggTvCredentials();
    const phone = user.generalInformation?.phone || user.generalInformation?.mobile;
    
    if (!phone) throw new Error("Phone number is required for IPTV pack");

    const payload = {
      ...creds,
      phone: phone,
      plan_id: String(planId),
      month: "1",
      mode: "ADD"
    };

    console.log("[ZiggTV] Calling assign pack for", phone, "plan:", planId);
    const response = await axios.post(`${ZIGGTV_BASE_URL}/subscription`, payload);
    console.log("[ZiggTV] Assign success:", response.data);
    return response.data;
  } catch (error) {
    console.error("[ZiggTV] Assign pack error:", error.response?.data || error.message);
    throw error;
  }
}

async function getZiggTvSubscriberDetails(phone) {
  try {
    const creds = getZiggTvCredentials();
    const payload = {
      ...creds,
      phone: phone
    };

    console.log("[ZiggTV] Fetching details for", phone);
    const response = await axios.get(`${ZIGGTV_BASE_URL}/fetch_customer_status`, { data: payload });
    console.log("[ZiggTV] Fetch success:", response.data);
    return response.data;
  } catch (error) {
    console.error("[ZiggTV] Fetch details error:", error.response?.data || error.message);
    throw error;
  }
}

async function cancelZiggTvPack(phone, planId, month = "1") {
  try {
    const creds = getZiggTvCredentials();
    const payload = {
      ...creds,
      phone: phone,
      plan_id: String(planId),
      month: String(month),
      mode: "DEACT"
    };

    console.log("[ZiggTV] Calling cancel pack for", phone, "plan:", planId);
    const response = await axios.post(`${ZIGGTV_BASE_URL}/subscription`, payload);
    console.log("[ZiggTV] Cancel success:", response.data);
    return response.data;
  } catch (error) {
    console.error("[ZiggTV] Cancel pack error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  createZiggTvUser,
  assignZiggTvPack,
  getZiggTvSubscriberDetails,
  cancelZiggTvPack
};
