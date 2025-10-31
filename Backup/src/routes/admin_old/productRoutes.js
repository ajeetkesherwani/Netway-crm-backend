const express = require("express");
const router = express.Router();

const fileUploader = require("../../middlewares/fileUploader");
const {
  adminAuthenticate,
} = require("../../controllers/admin/auth/adminAuthenticate");

const {
  createProduct,
} = require("../../controllers/admin/productController/createProduct");

const {
  updateProduct,
} = require("../../controllers/admin/productController/updateProduct");
const {
  getAllProduct,
} = require("../../controllers/admin/productController/getAllProduct");
const {
  getAllVendorProduct,
} = require("../../controllers/admin/productController/getAllVendorProduct");
const {
  productDetail,
} = require("../../controllers/admin/productController/productDetail");
const {
  productDelete,
} = require("../../controllers/admin/productController/productDelete");

const { 
  getProductBySubCat 
} = require("../../controllers/admin/productController/getProductBySubCat");

router.get("/list/:subCatId", adminAuthenticate, getProductBySubCat);
router.get("/list/", adminAuthenticate, getAllProduct);
router.get("/list/:vendorId", adminAuthenticate, getAllVendorProduct);
router.post(
  "/create",
  adminAuthenticate,
  fileUploader("product", [
    { name: "primary_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 5 },
  ]),
  createProduct
);
router.patch(
  "/update/:productId",
  adminAuthenticate,
  fileUploader("product", [
    { name: "primary_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 5 },
  ]),
  updateProduct
);
router.get("/details/:productId", adminAuthenticate, productDetail);
router.delete("/delete/:id", adminAuthenticate, productDelete);



module.exports = router;
