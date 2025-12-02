const { body } = require("express-validator");

module.exports = [
  // body("address.fullName").notEmpty().withMessage("Full name is required"),
  // body("address.mobileNumber")
  //   .notEmpty()
  //   .withMessage("Mobile number is required"),
  // body("address.addressLine1")
  //   .notEmpty()
  //   .withMessage("Address line 1 is required"),
  // body("address.city").notEmpty().withMessage("City is required"),
  // body("address.state").notEmpty().withMessage("State is required"),
  // body("address.country").notEmpty().withMessage("Country is required"),
  // body("address.pincode").notEmpty().withMessage("Pincode is required"),
  body("cart")
    .isArray({ min: 1 })
    .withMessage("Cart must contain at least one item"),
  body("cart.*.vendorId").notEmpty().withMessage("vendorId is required"),
  body("cart.*.products")
    .isArray({ min: 1 })
    .withMessage("At least one product is required per vendor"),
  body("cart.*.products.*.productId")
    .notEmpty()
    .withMessage("productId is required"),
  body("cart.*.products.*.quantity")
    .notEmpty()
    .withMessage("quantity is required"),
  body("cart.*.products.*.price").notEmpty().withMessage("price is required"),
  // body("cart.*.products.*.variant.variantTypeId")
  //   .notEmpty()
  //   .withMessage("variantTypeId is required"),
  // body("cart.*.products.*.variant.value")
  //   .notEmpty()
  //   .withMessage("variant value is required"),
];
