const axios = require('axios');
require('dotenv').config();
const whatsappTemplates = require("../utils/whatsappTemplates");
const { recordMonitoringLog } = require("./monitoringLogService");

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
  const template = whatsappTemplates[templateName];
  const isAuthentication =
    template?.category === "AUTHENTICATION" ||
    /otp|password|login/i.test(String(templateName || ""));
  const renderedMessage = template?.content
    ? template.content.replace(/{{(\d+)}}/g, (placeholder, index) => {
        if (isAuthentication) return "[REDACTED]";
        const value = bodyParams[Number(index) - 1];
        return value === undefined ? placeholder : String(value);
      })
    : "";
  const recordMessageLog = async (entry) => {
    try {
      await recordMonitoringLog(entry);
    } catch (logError) {
      console.error("[Monitoring] Failed to save WhatsApp log:", logError.message);
    }
  };

  try {
    const apiKey = process.env.WHATSAPP_API_KEY;
    if (!apiKey) {
      console.warn("[WhatsApp] WHATSAPP_API_KEY is not defined in config.env. Skipping notification.");
      await recordMessageLog({
        type: "whatsapp",
        action: "WHATSAPP_REJECTED",
        module: "notifications",
        description: "WhatsApp notification skipped because provider credentials are unavailable.",
        channel: "whatsapp",
        recipient: phone,
        templateName,
        message: renderedMessage,
        isAuthentication: false,
        provider: "QuickMessage",
        status: "REJECTED",
      });
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
    await recordMessageLog({
      type: "whatsapp",
      action: "WHATSAPP_SENT",
      module: "notifications",
      description: "WhatsApp template submitted to the provider.",
      channel: "whatsapp",
      recipient: formattedPhone,
      templateName,
      message: renderedMessage,
      isAuthentication: false,
      provider: "QuickMessage",
      providerMessageId:
        response.data?.messageId ||
        response.data?.message_id ||
        response.data?.id,
      status: "SENT",
      details: { providerStatusCode: response.status },
    });
    return response.data;
  } catch (error) {
    await recordMessageLog({
      type: "whatsapp",
      action: "WHATSAPP_FAILED",
      module: "notifications",
      description: "WhatsApp provider request failed.",
      channel: "whatsapp",
      recipient: phone,
      templateName,
      message: renderedMessage,
      isAuthentication: false,
      provider: "QuickMessage",
      status: "FAILED",
      details: {
        providerStatusCode: error.response?.status,
        errorCode: error.code,
      },
    });
    console.error("[WhatsApp] Failed to send template message:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendWhatsappNotification
};
