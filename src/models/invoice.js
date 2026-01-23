const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    package: {
      type:  mongoose.Schema.Types.ObjectId,
       ref: "Package",
       required: true
    },
    packageName:  {
        type: String,
        default:""
    },
    packageType: {
        isOtt: { type: Boolean, default: false},
        isIptv: { type: Boolean, default: false },
        internet: { type: Boolean, default: false }
    },
    duration: {
      startDate: { type: Date }, 
      endDate: { type: Date },   
    },
    amount: {
      type: Number, 
      required: true,
    },
    paidAmount: {
    type: Number,
    default: 0
    },
    adminAmount: {
        type: Number,
        default: 0
    },
    lcoAmount: {
      type: Number,
      default: 0,
    },
    resellerAmount: {
      type: Number,
      default: 0,
    },
    addedById: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "addedByType",
    },
    addedByType: {
      type: String,
      enum: ["Admin", "Reseller", "Lco", "User"],
    },
    comment: {
      type: String,
      default: "",
    },
    paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded',"Paid", "Unpaid", "Partial", "ExtraPaid"], // you can modify as needed
    default: 'Pending'
    }
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;
