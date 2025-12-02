const AddToCart = require("../../../models/addToCart");
const Product = require("../../../models/products");
const ProductInventory = require("../../../models/productInventry");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/responseHandler");

exports.createAddtocart = catchAsync(async (req, res, next) => {
  try {
    const user_Id = req.user.id;
    const { product_Id, vendorId, pro_qty, variants } = req.body;

    // Validate input data
    if (!product_Id) return next(new AppError("product_Id is required", 400));
    if (!vendorId) return next(new AppError("vendorId is required", 400));
    if (!pro_qty) return next(new AppError("pro_qty is required", 400));
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return next(new AppError("variants array is required", 400));
    }

    // ✅ Fetch product base price
    const product = await Product.findById(product_Id).select(
      "discountedPrice price"
    );
    if (!product) return next(new AppError("Product not found", 404));

    const basePrice = product.discountedPrice || product.price;

    // ✅ Find matching inventoryData for the selected variants
    const inventoryDoc = await ProductInventory.findOne({
      product_id: product_Id,
    }).lean();
    console.log(inventoryDoc);
    if (
      !inventoryDoc ||
      !inventoryDoc.inventoryData ||
      inventoryDoc.inventoryData.length === 0
    ) {
      return next(new AppError("No inventory data found for product", 404));
    }

    // 🔍 Match variants with inventoryData
    const selectedInventory = inventoryDoc.inventoryData.find((inv) => {
      const variantMap = new Map(
        inv.variantData.map((v) => [
          v.variantType_id.toString(),
          v.value.toLowerCase(),
        ])
      );
      return variants.every((sel) => {
        const match =
          variantMap.get(sel.variantTypeId.toString()) ===
          sel.value.toLowerCase();
        return match;
      });
    });

    if (!selectedInventory) {
      successResponse(
        res,
        "Selected variant combination not available in inventory",
        {},
        200
      );
    }

    const addOnPrice = selectedInventory.add_on_price || 0;
    const finalPrice = basePrice + addOnPrice;

    // ✅ Check if cart already has this product with same variant combo
    const existingCart = await AddToCart.findOne({
      user_Id,
      product_Id,
      variants: {
        $all: variants.map((v) => ({
          variantTypeId: v.variantTypeId.toString(),
          value: v.value.toLowerCase(),
        })),
      },
    });

    if (existingCart) {
      // If a matching cart item exists, update the existing item
      existingCart.quantity += Number(pro_qty); // Add to existing quantity
      existingCart.basePrice = basePrice;
      existingCart.addOnPrice = addOnPrice;
      existingCart.finalPrice = finalPrice;
      existingCart.variants = variants; // Update the variants (even if they're the same)

      await existingCart.save(); // Save the updated cart item
      successResponse(res, "Cart updated successfully", existingCart, 200);
    }

    // ✅ Create new cart item if it doesn't exist or variant combinations differ
    const newAddtocart = new AddToCart({
      user_Id,
      product_Id,
      vendorId,
      quantity: Number(pro_qty),
      variants,
      basePrice,
      addOnPrice,
      finalPrice,
    });

    await newAddtocart.save(); // Save the new cart item

    successResponse(
      res,
      "Product added to cart successfully",
      newAddtocart,
      201
    );
  } catch (err) {
    console.error(err);
    errorResponse(res,"Something went wrong while adding to cart",500,err.message);
    // return next(new AppError("Something went wrong while adding to cart", 500));
  }
});
