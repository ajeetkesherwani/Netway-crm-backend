const express = require("express");
const router = express.Router();
const bannerController = require("../../controllers/admin/banner/banner");
const fileUploader = require("../../middlewares/fileUploader");

// Create Banner
router.post("/create", fileUploader("banner", [{ name: "file", maxCount: 1 }]), bannerController.createBanner);

// Get all Banners (with optional search and sorting by short number)
router.get("/list", bannerController.getBanners);

// Get Single Banner
router.get("/:id", bannerController.getBannerById);

// Update Banner
router.put("/update/:id", fileUploader("banner", [{ name: "file", maxCount: 1 }]), bannerController.updateBanner);

// Delete Banner
router.delete("/delete/:id", bannerController.deleteBanner);

module.exports = router;
