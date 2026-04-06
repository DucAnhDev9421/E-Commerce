let mongoose = require('mongoose');

let paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    method: {
        type: String,
        enum: ['COD', 'VNPAY'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
        default: 'PENDING'
    },
    vnpayData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    transactionRef: {
        type: String,
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('payments', paymentSchema);
