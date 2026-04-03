let mongoose = require('mongoose');

let orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    },
    shippingAddress: {
        receiverName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    note: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('orders', orderSchema);
