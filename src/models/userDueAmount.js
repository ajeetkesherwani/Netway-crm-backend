const mongoose = require('mongoose');

const UserDueAmountSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueAmount: { type: Number, required: true, default: 0 },
    modefPayment: { type: String, enum: ['Cash', 'Online'], default: 'Online' },
    status: { type: String, enum: ['Pending', 'Paid'], default: 'Paid' },
}, { timestamps: true });

const UserDueAmount = mongoose.model('UserDueAmount', UserDueAmountSchema);

module.exports = UserDueAmount;