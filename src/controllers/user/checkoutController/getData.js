const mongoose = require("mongoose");
const AddToCart = require("../../../models/addToCart");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getData = catchAsync(async (req, res, next) => {
  try {
    const user_Id = req.user.id;
    if (!user_Id) return next(new AppError("id is required", 400));
    const cartItems = await AddToCart.find({ user_Id: user_Id });
    console.log(cartItems);

    if (!cartItems.length) {
      return next(new AppError("Cart not found", 404));
    }

    // Step 2: Calculate totals
    let totalAmount = 0;
    const items = cartItems.map((item) => {
      totalAmount += item.finalPrice * item.quantity;
      return {
        product_Id: item.product_Id,
        vendorId: item.vendorId,
        quantity: item.quantity,
        variants: item.variants,
        basePrice: item.basePrice,
        addOnPrice: item.addOnPrice,
        finalPrice: item.finalPrice,
      };
    });

    // Step 3: Build checkout object
    const checkoutData = {
      user_Id: new mongoose.Types.ObjectId(user_Id), // Corrected line
      items,
      totalAmount,
      deliveryCharge: 0, // Assuming no delivery charge for simplicity
      multiStoreHandlingFee: 0, // Assuming multi-vendor platform
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    successResponse(
      res,
      "Checkout data retrieved successfully",
      checkoutData,
      200
    );
  } catch (err) {
    console.error("Checkout creation failed:", err);
    throw err;
  }
});
