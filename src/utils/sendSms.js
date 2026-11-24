const axios = require("axios");
const { recordMonitoringLog } = require("../services/monitoringLogService");

const sendSMS = async (mobile, message, metadata = {}) => {
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

    await recordMonitoringLog({
      type: "sms",
      action: "SMS_SENT",
      module: "notifications",
      description: "SMS submitted to the provider.",
      channel: "sms",
      recipient: mobile,
      templateName: metadata.templateName,
      message: metadata.auditMessage || message,
      isAuthentication:
        !metadata.auditMessage &&
        /otp|login|password|credential/i.test(metadata.templateName || ""),
      provider: "osd7.in",
      providerMessageId:
        response.data?.messageId || response.data?.message_id || response.data?.id,
      status: "SENT",
      details: { providerStatusCode: response.status },
    }).catch((logError) => {
      console.error("[Monitoring] Failed to save SMS log:", logError.message);
    });

    return response.data;

  } catch (error) {
    await recordMonitoringLog({
      type: "sms",
      action: "SMS_FAILED",
      module: "notifications",
      description: "SMS provider request failed.",
      channel: "sms",
      recipient: mobile,
      templateName: metadata.templateName,
      message: metadata.auditMessage || message,
      isAuthentication:
        !metadata.auditMessage &&
        /otp|login|password|credential/i.test(metadata.templateName || ""),
      provider: "osd7.in",
      status: "FAILED",
      details: { providerStatusCode: error.response?.status, errorCode: error.code },
    }).catch((logError) => {
      console.error("[Monitoring] Failed to save SMS failure log:", logError.message);
    });
    console.log("SMS provider request failed", {
      status: error.response?.status,
      code: error.code,
    });
  }
};

module.exports = { sendSMS };


