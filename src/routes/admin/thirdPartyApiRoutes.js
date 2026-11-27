const express = require("express");
const { adminAuthenticate } = require("../../controllers/admin/auth/adminAuthenticate");
const {
  getThirdPartyApiConfigurations,
} = require("../../controllers/admin/settings/getThirdPartyApiConfigurations");

const router = express.Router();

router.get("/", adminAuthenticate, getThirdPartyApiConfigurations);

module.exports = router;
