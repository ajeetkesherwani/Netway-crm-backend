// models/SubOrder.js

const mongoose = require("mongoose");

const subOrderSchema = new mongoose.Schema(
  {
    mainOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainOrder",
      required: true,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    // 🛍️ Products in the vendor's order
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        name: String,
        quantity: Number,
        variant: [
          {
            value: String,
            variantTypeId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "VariantType",
            },
          },
        ],
        price: Number,
        discountedPrice: Number,
        gstPercentage: Number,
        gstAmount: Number,
        totalItemAmount: Number,
      },
    ],

    subTotal: { type: Number, required: true }, // excl. GST
    totalGST: { type: Number, required: true },
    totalAmount: { type: Number, required: true }, // incl. GST

    // 🚚 Delivery Info & Commission
    deliveryCharge: {
      amount: Number,
      gstPercentage: Number,
      gstAmount: Number,
      deliveryBoyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryBoy",
      },
    },

    commission: {
      percentage: Number,
      amount: Number,
      gstPercentage: Number,
      gstAmount: Number,
    },

    // 💸 Final vendor payout (after deductions)
    vendorPayout: {
      amount: Number,
      status: { type: String, enum: ["pending", "paid"], default: "pending" },
    },

    // 🎟️ Coupon Details
    coupon: {
      code: { type: String },
      discountAmount: { type: Number, default: 0 },
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "confirmed",
        "shipped",
        "pickuped",
        "delivered",
        "cancelled",
        "return_requests",
        "return_received",
      ],
      default: "pending",
    },
    pickupotp: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isDeliveryAsign: {
      type: Boolean,
      default: false,
    },
    assignDeliveryBoyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubOrder", subOrderSchema);
