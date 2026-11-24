const smsTemplates = require("./smsTemplate");
const { sendSMS } = require("./sendSms");
const { sanitizeMessage } = require("./sanitizeLogData");

const sensitivePlaceholderPattern =
  /password|passwd|pass|otp|token|secret|authorization|api.?key|access.?code|working.?key/i;

 //Replace variables in template

const generateMessage = (templateName, variables = {}) => {
  const template = smsTemplates[templateName];

  if (!template) {
    throw new Error(`SMS template "${templateName}" not found`);
  }

  let message = template.content;

  // Replace all variables dynamically
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{${key}}`, "g");
    message = message.replace(regex, variables[key]);
  });

  return message;
};

const generateAuditMessage = (templateName, variables = {}) => {
  const template = smsTemplates[templateName];

  if (!template) {
    throw new Error(`SMS template "${templateName}" not found`);
  }

  return template.content.replace(/\{([^{}]+)\}/g, (placeholder, key) => {
    if (!Object.prototype.hasOwnProperty.call(variables, key)) {
      return placeholder;
    }

    return sensitivePlaceholderPattern.test(key)
      ? "[REDACTED]"
      : String(variables[key]);
  });
};

 // Send SMS using template
const sendTemplateSMS = async (mobile, templateName, variables = {}) => {
  try {
    const message = generateMessage(templateName, variables);
    const auditMessage = generateAuditMessage(templateName, variables);

    console.log("SMS Mobile:", mobile);
    console.log("SMS Template:", templateName);
    console.log("SMS Final Message:", sanitizeMessage(auditMessage));

    return await sendSMS(mobile, message, { templateName, auditMessage });

  } catch (error) {
    console.log("Template SMS error:", error.message);
  }
};

module.exports = {
  sendTemplateSMS
};
