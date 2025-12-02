const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  branchName: { type: String, required: true },
  ifscCode: { type: String, required: true },
  accountNo: { type: String, required: true },
  holderName: { type: String, required: true },
});

// Return record per product (from suborders)
const returnProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  subOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubOrder",
    required: true,
  },
  reason: { type: String, required: true },
  message: { type: String },
  status: {
    type: String,
    enum: [
      "requested",
      "approved",
      "picked",
      "inReview",
      "completed",
      "rejected",
    ],
    default: "requested",
  },
});

const orderReturnSchema = new mongoose.Schema(
  {
    mainOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainOrder",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    returnReason: { type: String, required: true },
    returnMessage: { type: String, required: true },
    is_refundToSourceAccount: { type: Boolean, default: false },
    refundNewAccount: {
      type: accountSchema,
      required: function () {
        return !this.is_refundToSourceAccount; // Only require when refunding to a new account
      },
    },
    products: [returnProductSchema], // Multiple product-level returns
    uploadFiles: [{ type: String }], // Upload files for the whole return (optional)
  },
  { timestamps: true }
);

// Add custom pre-validation hook
orderReturnSchema.pre("validate", function (next) {
  if (!this.is_refundToSourceAccount && !this.refundNewAccount) {
    return next(
      new Error(
        "refundNewAccount is required if refund is not to source account"
      )
    );
  }
  next();
});

const OrderReturn = mongoose.model("OrderReturn", orderReturnSchema);

module.exports = OrderReturn;
