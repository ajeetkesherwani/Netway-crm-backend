const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "config.env") });

const {
  getCCAvenueConfig,
} = require("./src/config/ccavenue.config");

const config = getCCAvenueConfig();

console.log({
  environment: config.environment,
  merchantApiUrl: config.merchantApiUrl,
  merchantIdConfigured: Boolean(config.merchantId),
  accessCodeConfigured: Boolean(config.accessCode),
  workingKeyConfigured: Boolean(config.workingKey),
});