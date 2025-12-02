const express = require("express");

const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");
const {
  createCmsPage,
} = require("../../controllers/admin/cmsPageController/createCmsPage");
const {
  getAllCmsPage,
} = require("../../controllers/admin/cmsPageController/getCmsPage");
const {
  updateCmsPage,
} = require("../../controllers/admin/cmsPageController/updateCmsPage");

const router = express.Router();

router.get("/list/:type", adminAuthenticate, getAllCmsPage);
router.post("/create", adminAuthenticate, createCmsPage);
router.patch("/update/:id", adminAuthenticate, updateCmsPage);

module.exports = router;
