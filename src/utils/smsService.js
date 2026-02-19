const smsTemplates = require("./smsTemplate");
const { sendSMS } = require("./sendSms");


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

 // Send SMS using template
const sendTemplateSMS = async (mobile, templateName, variables = {}) => {
  try {
    const message = generateMessage(templateName, variables);

    console.log("SMS Mobile:", mobile);
    console.log("SMS Template:", templateName);
    console.log("SMS Final Message:", message);


    return await sendSMS(mobile, message);

  } catch (error) {
    console.log("Template SMS error:", error.message);
  }
};

module.exports = {
  sendTemplateSMS
};
