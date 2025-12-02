const express = require("express");

const { 
    createCmgPage 
} = require("../../controllers/vendor/cmsPageController/createCmgPage");

const { 
    getCmsPage 
} = require("../../controllers/vendor/cmsPageController/get cmsPage");

const { 
    updateCmsPage 
} = require("../../controllers/vendor/cmsPageController/updateCmsPage");

const router = express.Router();

router.post("/create", createCmgPage);
router.get("/list", getCmsPage);
router.patch("/list/:id", updateCmsPage);

module.exports = router;