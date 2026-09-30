const axios = require('axios');
require('dotenv').config();

const WHATSAPP_API_URL = "https://app.quickmessage.in/api/v1/send/template";

/**
 * Send a WhatsApp template message using QuickMessage API
 * @param {string} phone - The recipient's phone number (must include country code, e.g. "919876543210")
 * @param {string} templateName - The exact approved template name
 * @param {Array} bodyParams - Array of dynamic values for the template body (e.g., ["John", "12345"])
 * @param {Array} headerParams - Array of values for the header (e.g., ["Header text", "https://example.com/image.jpg"])
 * @param {Array} buttonParams - Array of values for the buttons (e.g., ["12345"])
 * @returns {Object} API response
 */
async function sendWhatsappNotification(phone, templateName, bodyParams = [], headerParams = [], buttonParams = []) {
  try {
    const apiKey = process.env.WHATSAPP_API_KEY;
    if (!apiKey) {
      console.warn("[WhatsApp] WHATSAPP_API_KEY is not defined in config.env. Skipping notification.");
      return null;
    }

    // Ensure phone starts with country code if it's 10 digits
    let formattedPhone = phone;
    if (formattedPhone.length === 10) {
      formattedPhone = "91" + formattedPhone;
    }

    const payload = {
      phone: formattedPhone,
      template_name: templateName,
      header_params: headerParams,
      body_params: bodyParams,
      button_params: buttonParams
    };

    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey
      }
    });

    console.log(`[WhatsApp] Sent template '${templateName}' to ${formattedPhone} successfully.`);
    return response.data;
  } catch (error) {
    console.error("[WhatsApp] Failed to send template message:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendWhatsappNotification
};
