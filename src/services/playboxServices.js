const axios = require('axios');
require('dotenv').config();

const PLAYBOX_BASE_URL = "https://api.playboxtv.in/v5";

let cachedToken = null;
let tokenExpiry = null;

async function getPlayboxToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log("[PlayBoxTV] Using cached token...");
    return cachedToken;
  }

  console.log("[PlayBoxTV] Generating new token from API...");
  try {
    const response = await axios.post(`${PLAYBOX_BASE_URL}/token`, {
      iss: process.env.PLAYBOX_ISS || "netwayinternetservices",
      aud: process.env.PLAYBOX_AUD || "netway9net"
    }, {
      headers: {
        "x-api-key": process.env.PLAYBOX_API_KEY
      }
    });
    
    console.log("[PlayBoxTV] Token API Raw Response:", response.data);

    // The API returns the token inside the "data" field
    if (response.data && response.data.data) {
      // We must append "Bearer " manually for the next API call
      cachedToken = `Bearer ${response.data.data}`; 
      
      // Cache token for 23 hours to be safe (it expires in 24 hours)
      tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
      console.log("[PlayBoxTV] Token generated successfully!");
      return cachedToken;
    }
    
    throw new Error(`Invalid token response data: ${JSON.stringify(response.data)}`);
  } catch (err) {
    console.error("[PlayBoxTV] Token generation API error:", err.response?.data || err.message);
    throw new Error("Failed to get PlayBoxTV token. Check console for details.");
  }
}

async function assignPlayboxPack(user, packCode) {
  try {
    // 1. Generate Token automatically
    const token = await getPlayboxToken();
    const partnerKey = process.env.PLAYBOX_PARTNER_KEY;

    // 2. Take details from the user object (frontend input)
    let phone = user.generalInformation?.phone || user.generalInformation?.mobile || user.phone;
    if (!phone) throw new Error("Phone number is required for OTT pack");

    // 3. Build the Payload exactly as required
    const payload = {
      phone: phone,
      partnerKey: partnerKey,
      packCode: packCode, // Package selected from frontend
      name: user.generalInformation?.name || user.name || "Customer",
      email: user.generalInformation?.email || user.email || "customer@example.com",
      customerId: String(user.username || user.UserID || user._id || "unknown") // Use username or UserID from your system
    };

    console.log("[PlayBoxTV] Calling assignPack with payload:", payload);

    // 4. Hit the API to create user & assign package
    const response = await axios.post(`${PLAYBOX_BASE_URL}/assignPack`, payload, {
      headers: {
        "Authorization": token,
        "x-api-key": process.env.PLAYBOX_API_KEY,
        "Content-Type": "application/json"
      }
    });

    console.log("[PlayBoxTV] Success! User Created & Package Assigned:", response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.statusCode === 400 && error.response.data.message === 'succeeded') {
      console.log("[PlayBoxTV] User already exists (treated as success):", error.response.data);
      return error.response.data;
    }
    console.error("[PlayBoxTV] assignPack error:", error.response?.data || error.message);
    throw error;
  }
}

async function getPlayboxUserDetails(phone) {
  try {
    const token = await getPlayboxToken();
    const partnerKey = process.env.PLAYBOX_PARTNER_KEY;
    
    console.log("[PlayBoxTV] Fetching details for phone:", phone);
    
    const response = await axios.get(`${PLAYBOX_BASE_URL}/getPack`, {
      params: {
        partnerKey: partnerKey,
        phone: phone
      },
      headers: {
        "Authorization": token,
        "x-api-key": process.env.PLAYBOX_API_KEY
      }
    });

    console.log("[PlayBoxTV] Fetch success:", response.data);
    return response.data;
  } catch (error) {
    console.error("[PlayBoxTV] Fetch details error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  assignPlayboxPack,
  getPlayboxUserDetails
};
