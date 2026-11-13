const express = require("express");
const { adminAuthenticate } = require("../../controllers/admin/auth/adminAuthenticate");
const { getCmsList } = require("../../controllers/admin/cmsController/getCms");
const { updateCms } = require("../../controllers/admin/cmsController/updateCms");

const router = express.Router();

router.get("/list", adminAuthenticate, getCmsList);
router.patch("/update/:id", adminAuthenticate, updateCms);

module.exports = router;
