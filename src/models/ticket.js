// const mongoose = require('mongoose');

// const ticketSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // or 'User' if applicable
//     required: true
//   },
//   ticketNumber: {
//     type: String,
//     required: true
//   },
//   personName: {
//     type: String,
//     required: true
//   },
//   personNumber: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String
//   },
//   address: {
//     type: String
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Category"
//   },
//   fileI: {
//     type: String // URL or file path
//   },
//   fileII: {
//     type: String
//   },
//   fileIII: {
//     type: String
//   },
//   callSource: {
//     type: String,
//     enum: ['Phone', 'Email', 'Web', 'Walk-in', 'Other'],
//     default: 'Phone'
//   },
//   severity: {
//     type: String,
//     enum: ['Low', 'Medium', 'High', 'Critical'],
//     required: true
//   },
//   assignToId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Staff",
//     default: null
//   },
//   callDescription: {
//     type: Number, // in seconds or minutes — clarify as per your need
//     default: 0
//   },
//   isChargeable: {
//     type: Boolean,
//     default: false
//   },
//   productId: {
//     type: String,
//     default: ""
//   },
//   price: {
//     type: Number,
//     default: 0
//   },
//   status: {
//     type: String,
//     enum: ["Open", "Closed", "Fixed", "Assigned", "Resolved", "NonAssigned"],
//     default: "Open"
//   },
//   reassign: [
//     {
//       staffId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Staff"
//       },
//       currentStatus: {
//         type: String,
//         enum: ["Open", "Closed", "Fixed", "Assigned", "Resolved", "NonAssigned"],
//         default: "Open"
//       },
//       assignedAt: {
//         type: Date,
//         default: Date.now
//       }
//     }
//   ]
// }, {
//   timestamps: true
// });

// // const Ticket = mongoose.model('Ticket', ticketSchema);
// const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
// module.exports = Ticket;

const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or 'User' if applicable
      required: true,
    },
    ticketNumber: {
      type: String,
      required: true,
    },
    personName: {
      type: String,
      required: true,
    },
    personNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketCategory",
    },
    fileI: { type: String },
    fileII: { type: String },
    fileIII: { type: String },

    callSource: {
      type: String,
      enum: ["Phone", "Email", "Web", "Walk-in", "Other"],
      default: "Phone",
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true,
    },
    assignToId: {
      type: mongoose.Schema.Types.ObjectId,
      // refPath: "assignToModel", // 👈 can dynamically refer to Admin, Reseller, or LCO
      default: null,
    },
    assignToModel: {
      type: String,
      enum: ["Admin", "Reseller", "Lco", "Staff"],
      default: null,
    },

    callDescription: {
      type: Number,
      default: 0,
    },
    isChargeable: {
      type: Boolean,
      default: false,
    },
    productId: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "Fixed", "Assigned", "Resolved", "NonAssigned", "Reassigned", "Approval"],
      default: "Open",
    },

    reassign: [
      {
        staffId: {
          type: mongoose.Schema.Types.ObjectId,
          // ref: "Staff",
        },
        currentStatus: {
          type: String,
          enum: ["Open", "Closed", "Fixed", "Assigned", "Resolved", "NonAssigned", "Reassigned", "Approval"],
          default: "Open",
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ✅ NEW FIELDS
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByType", // dynamic reference
      required: true,
    },
    createdByType: {
      type: String,
      enum: ["Admin", "Reseller", "Lco"],
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "lastModifiedByType",
      default: null,
    },
    lastModifiedByType: {
      type: String,
      enum: ["Admin", "Reseller", "Lco"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Auto update `lastModifiedBy` when document updates
ticketSchema.pre("save", function (next) {
  if (this.isModified()) {
    this.lastModifiedAt = new Date();
  }
  next();
});

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
