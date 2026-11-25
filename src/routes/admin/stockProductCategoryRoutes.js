const express = require("express");
const router = express.Router();
const {
    getStockProductCategory,
    createStockProductCategory,
    updateStockProductCategory,
    deleteStockProductCategory
} = require("../../controllers/admin/stockProduactCategory/stockProductCategorymodule");
const { adminAuthenticate } = require("../../controllers/admin/auth/adminAuthenticate");

router.use(adminAuthenticate);


router.route("/")
    .get(getStockProductCategory)
    .post(createStockProductCategory);

router.route("/:id")
    .put(updateStockProductCategory)
    .delete(deleteStockProductCategory);

module.exports = router;
