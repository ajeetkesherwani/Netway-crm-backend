const mongoose = require("mongoose");

const mainOrderSchema = new mongoose.Schema(
  {
    user_Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderNumber: { type: String, unique: true, required: true },

    totalAmount: { type: Number, required: true }, // grand total
    totalGST: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 }, // combined coupon discount
    deliveryCharge: { type: Number, default: 0 },
    deliveryGST: { type: Number, default: 0 },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "placed",
    },

    couponSummary: [
      {
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
        code: String,
        discountAmount: { type: Number, default: 0 },
      },
    ],

    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderAddress",
      required: true,
    },
    assignDileveryBoyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
    },
    isDriverAssign: {
      type: Boolean,
      default: false,
    },
    deliveryInstructions: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// ✅ Add this virtual after schema definition but before exporting
mainOrderSchema.virtual("subOrders", {
  ref: "SubOrder", // The model to use
  localField: "_id", // Field in MainOrder
  foreignField: "mainOrderId", // Field in SubOrder that relates to MainOrder
});

// ✅ If you want it to be included in JSON output, add this:
mainOrderSchema.set("toObject", { virtuals: true });
mainOrderSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("MainOrder", mainOrderSchema);
