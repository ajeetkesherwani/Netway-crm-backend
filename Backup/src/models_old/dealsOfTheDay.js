const mongoose = require("mongoose");

const dealsOfTheDay = mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    cat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    },
    image: {
      type: String,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const DealsOfTheDay = mongoose.model("DealsOfTheDay", dealsOfTheDay);
module.exports = DealsOfTheDay;
