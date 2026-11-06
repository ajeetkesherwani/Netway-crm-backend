const getCCAvenueConfig = () => {
  const requiredEnvVariables = [
    "CCAVENUE_MERCHANT_ID",
    "CCAVENUE_ACCESS_CODE",
    "CCAVENUE_WORKING_KEY",
  ];

  const missingVariables = requiredEnvVariables.filter(
    (key) => !process.env[key]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing CCAvenue environment variables: ${missingVariables.join(", ")}`
    );
  }

  const environment = process.env.CCAVENUE_ENV || "staging";

  if (!["staging", "production"].includes(environment)) {
    throw new Error("CCAVENUE_ENV must be staging or production");
  }

  const callbackUrlValue =
    process.env.CCAVENUE_CALLBACK_URL ||
    (process.env.API_BASE_URL
      ? `${new URL(process.env.API_BASE_URL).origin}/api/user/recharge/ccavenue/callback`
      : null);

  if (!callbackUrlValue) {
    throw new Error(
      "Set CCAVENUE_CALLBACK_URL or API_BASE_URL to configure the CCAvenue callback"
    );
  }

  const callbackUrl = new URL(callbackUrlValue);
  if (
    !["http:", "https:"].includes(callbackUrl.protocol)
  ) {
    throw new Error("CCAvenue callback URL must use HTTP or HTTPS");
  }

  // Clean Merchant ID: CCAvenue requires strictly numeric Merchant ID (e.g. 1388489)
  const rawMerchantId = (process.env.CCAVENUE_MERCHANT_ID || "").trim();
  const numericMerchantId = rawMerchantId.replace(/\D/g, "");
  const merchantId = numericMerchantId || rawMerchantId;

  return {
    merchantId,
    rawMerchantId,
    accessCode: (process.env.CCAVENUE_ACCESS_CODE || "").trim(),
    workingKey: (process.env.CCAVENUE_WORKING_KEY || "").trim(),
    environment,
    callbackUrl: callbackUrl.toString(),
    paymentGatewayUrl:
      environment === "production"
        ? "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"
        : "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
    merchantApiUrl:
      environment === "production"
        ? "https://api.ccavenue.com/apis/servlet/DoWebTrans"
        : "https://apitest.ccavenue.com/apis/servlet/DoWebTrans",
  };
};

module.exports = { getCCAvenueConfig };