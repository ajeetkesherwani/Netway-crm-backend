const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebUser', // or 'User' if applicable
    required: true
  },
  ticketNumber: {
    type: String,
    required: true
  },
  personName: {
    type: String,
    required: true
  },
  personNumber: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  address: {
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  fileI: {
    type: String // URL or file path
  },
  fileII: {
    type: String
  },
  fileIII: {
    type: String
  },
  callSource: {
    type: String,
    enum: ['Phone', 'Email', 'Web', 'Walk-in', 'Other'],
    default: 'Phone'
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  assignToId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    default: null
  },
  callDescription: {
    type: Number, // in seconds or minutes — clarify as per your need
    default: 0
  },
  isChargeable: {
    type: Boolean,
    default: false
  },
  productId: {
    type: String,
    default: ""
  },
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["Open", "Closed", "Fixed", "Assigned", "Resolved", "NonAssigned"],
    default: "Open"
  },
  reassign: [
    {
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
      },
      currentStatus: {
        type: String,
        enum: ["Open", "Closed", "Fixed", "Assigned", "Resolved", "NonAssigned"],
        default: "Open"
      },
      assignedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

// const Ticket = mongoose.model('Ticket', ticketSchema);
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
