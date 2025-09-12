const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WebUser', // or 'User' if applicable
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
  cateogry: {
    type: String,
    required: true
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
  assigToId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff' // or 'User' if it's an admin/staff
  },
  callDeration: {
    type: Number, // in seconds or minutes — clarify as per your need
    default: 0
  },
  isChargeable: {
    type: Boolean,
    default: false
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product' // or whatever your product model is named
  },
  price: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Ticket', ticketSchema);
