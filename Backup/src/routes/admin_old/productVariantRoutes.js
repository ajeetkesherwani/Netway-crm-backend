const express = require("express");
const router = express.Router();

const fileUploader = require("../../middlewares/fileUploader");
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");
const {
  getAllProductVariant,
} = require("../../controllers/admin/productVariantController/getAllProductVariant");
const {
  createProductVariants,
} = require("../../controllers/admin/productVariantController/createProductVariant");
const {
  getProductVarientById,
} = require("../../controllers/admin/productVariantController/getProductVarientById");
const {
  getProductVarientByVarientId,
} = require("../../controllers/admin/productVariantController/getProductVarientByVarientId");
const {
  updateProductVarient,
} = require("../../controllers/admin/productVariantController/updateProductVarient");
const {
  deleteProductVarient,
} = require("../../controllers/admin/productVariantController/deleteProductVarient");

router.get("/list", adminAuthenticate, getAllProductVariant);
router.post("/create", adminAuthenticate, createProductVariants);
router.get("/getDataById/:id", adminAuthenticate, getProductVarientById);
router.patch("/update/:id", adminAuthenticate, updateProductVarient);
router.delete("/delete/:id", adminAuthenticate, deleteProductVarient);
router.get(
  "/getProductVarientByVarientId/:id",
  adminAuthenticate,
  getProductVarientByVarientId
);
module.exports = router;
