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
    !["http:", "https:"].includes(callbackUrl.protocol) ||
    (environment === "production" && callbackUrl.protocol !== "https:")
  ) {
    throw new Error("CCAvenue callback URL must use HTTPS in production");
  }

  return {
    merchantId: process.env.CCAVENUE_MERCHANT_ID,
    accessCode: process.env.CCAVENUE_ACCESS_CODE,
    workingKey: process.env.CCAVENUE_WORKING_KEY,
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