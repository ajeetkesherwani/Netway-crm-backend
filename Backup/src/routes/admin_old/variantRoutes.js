const express = require("express");
const router = express.Router();

const fileUploader = require("../../middlewares/fileUploader");
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");
const {
  createVariant,
} = require("../../controllers/admin/variantController/createVariant");
const {
  allVariant,
} = require("../../controllers/admin/variantController/allVariant");
const {
  deleteVariant,
} = require("../../controllers/admin/variantController/deleteVariant");
const {
  getDataById,
} = require("../../controllers/admin/variantController/getDataById");
const {
  updateVariant,
} = require("../../controllers/admin/variantController/updateVariant");
const { 
  getVariantsByProductId 
} = require("../../controllers/admin/variantController/getVaraintsByProductId");

router.get("/list", adminAuthenticate, allVariant);
router.post("/create", adminAuthenticate, createVariant);
router.patch("/update/:id", adminAuthenticate, updateVariant);
router.delete("/delete/:id", adminAuthenticate, deleteVariant);
router.get("/getDataById/:id", adminAuthenticate, getDataById);
router.get("/list/:productId", adminAuthenticate, getVariantsByProductId );

module.exports = router;
