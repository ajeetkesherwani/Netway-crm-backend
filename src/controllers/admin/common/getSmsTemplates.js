const smsTemplates = require("../../../utils/smsTemplate");
const whatsappTemplates = require("../../../utils/whatsappTemplates");

const getPlaceholders = (content, pattern) =>
  [...new Set(Array.from(content.matchAll(pattern), (match) => match[1]))];

exports.getSmsTemplates = (req, res) => {
  const sms = Object.entries(smsTemplates).map(([templateName, template]) => ({
    templateId: templateName,
    templateName,
    category: null,
    content: template.content,
    variables: getPlaceholders(template.content, /{([^{}]+)}/g),
  }));

  const whatsapp = Object.values(whatsappTemplates).map((template) => ({
    templateId: template.name,
    templateName: template.name,
    category: template.category,
    bodyParamsCount: template.bodyParamsCount,
    hasHeader: template.hasHeader,
    content: template.content,
    footer: template.footer,
    variables: getPlaceholders(template.content, /{{(\d+)}}/g),
  }));

  return res.status(200).json({
    status: "success",
    data: {
      sms,
      whatsapp,
    },
  });
};
