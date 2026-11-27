const getCredential = (label, configurationKeys, hasFallback = false) => {
  const configured =
    hasFallback || configurationKeys.some((key) => Boolean(process.env[key]));

  return {
    label,
    configurationKeys,
    configured,
    value: configured ? "Hidden" : "Not configured",
  };
};

const getThirdPartyApiConfigurations = (req, res) => {
  const isCCAvenueProduction = process.env.CCAVENUE_ENV === "production";
  const configurations = [
    {
      id: "sms-text",
      apiName: "SMS Text",
      apiType: "Text SMS",
      endpoints: [
        {
          method: "GET",
          url: "http://osd7.in/V2/http-api.php",
          purpose: "Send SMS",
        },
      ],
      authenticationType: "API key in query parameters",
      credentials: [getCredential("SMS API key", ["SMS_API_KEY"])],
    },
    {
      id: "quickmessage-whatsapp",
      apiName: "QuickMessage Official WhatsApp",
      apiType: "WhatsApp MSG",
      endpoints: [
        {
          method: "POST",
          url: "https://app.quickmessage.in/api/v1/send/template",
          purpose: "Send template message",
        },
      ],
      authenticationType: "API key request header",
      credentials: [getCredential("WhatsApp API key", ["WHATSAPP_API_KEY"])],
    },
    {
      id: "ipacct",
      apiName: "IPACCT",
      apiType: "IP Management / SOAP",
      endpoints: [
        {
          method: "SOAP",
          url: "https://139.5.198.59:443/0/api",
          purpose: "IP management",
        },
        {
          method: "SOAP",
          url: "https://139.5.198.58:443/0/bgpost",
          purpose: "IP billing",
        },
      ],
      authenticationType: "SOAP username and password",
      credentials: [
        getCredential("Username", ["IPACCT_API_USER", "IPACCT_USER"], true),
        getCredential("Password", ["IPACCT_API_PASS", "IPACCT_PASS"], true),
      ],
    },
    {
      id: "playbox-ott",
      apiName: "PlayBoxTV",
      apiType: "OTT",
      endpoints: [
        {
          method: "POST",
          url: "https://api.playboxtv.in/v5/token",
          purpose: "Generate access token",
        },
        {
          method: "POST",
          url: "https://api.playboxtv.in/v5/assignPack",
          purpose: "Assign OTT package",
        },
        {
          method: "GET",
          url: "https://api.playboxtv.in/v5/getPack",
          purpose: "Get subscriber package",
        },
        {
          method: "GET",
          url: "https://api.playboxtv.in/v5/{partnerKey}/packs",
          purpose: "List available packages",
        },
      ],
      authenticationType: "API key and partner key",
      credentials: [
        getCredential("API key", ["PLAYBOX_API_KEY"]),
        getCredential("Partner key", ["PLAYBOX_PARTNER_KEY"]),
      ],
    },
    {
      id: "ziggtv-iptv",
      apiName: "ZiggTV",
      apiType: "IPTV",
      endpoints: [
        {
          method: "POST",
          url: "http://crm.ziggtv.com/partner/api/customer/add",
          purpose: "Create subscriber",
        },
        {
          method: "POST",
          url: "http://crm.ziggtv.com/partner/api/subscription",
          purpose: "Assign or cancel IPTV package",
        },
        {
          method: "GET",
          url: "http://crm.ziggtv.com/partner/api/fetch_customer_status",
          purpose: "Get subscriber status",
        },
        {
          method: "GET",
          url: "http://crm.ziggtv.com/partner/api/lco/plans",
          purpose: "List IPTV plans",
        },
      ],
      authenticationType: "Credentials in request body",
      credentials: [
        getCredential("LCO code", ["ZIGGTV_LCO_CODE"]),
        getCredential("Login ID", ["ZIGGTV_LOGIN_ID"]),
        getCredential("API token", ["ZIGGTV_API_TOKEN"]),
      ],
    },
    {
      id: "ccavenue",
      apiName: "CCAvenue",
      apiType: "Payment Gateway",
      endpoints: [
        {
          method: "POST",
          url: isCCAvenueProduction
            ? "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"
            : "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
          purpose: "Payment initiation",
        },
        {
          method: "POST",
          url: isCCAvenueProduction
            ? "https://api.ccavenue.com/apis/servlet/DoWebTrans"
            : "https://apitest.ccavenue.com/apis/servlet/DoWebTrans",
          purpose: "Merchant API",
        },
        {
          method: "POST",
          url: "/api/user/recharge/ccavenue/callback",
          purpose: "Payment callback",
        },
      ],
      authenticationType: "Merchant ID, access code, and working key",
      credentials: [
        getCredential("Merchant ID", ["CCAVENUE_MERCHANT_ID"]),
        getCredential("Access code", ["CCAVENUE_ACCESS_CODE"]),
        getCredential("Working key", ["CCAVENUE_WORKING_KEY"]),
      ],
      environment: isCCAvenueProduction ? "Production" : "Staging",
    },
    {
      id: "gmail-smtp",
      apiName: "Gmail SMTP",
      apiType: "Email",
      endpoints: [
        {
          method: "SMTP",
          url: "smtp.gmail.com:587",
          purpose: "Send email notifications",
        },
      ],
      authenticationType: "SMTP username and password",
      credentials: [
        getCredential("Email account", ["EMAIL_USER"]),
        getCredential("App password", ["EMAIL_PASS"]),
      ],
    },
  ].map((configuration) => ({
    ...configuration,
    status: configuration.credentials.every((credential) => credential.configured)
      ? "Configured"
      : "Incomplete",
  }));

  res.status(200).json({
    success: true,
    data: configurations,
    credentialsMasked: true,
  });
};

module.exports = { getThirdPartyApiConfigurations };
