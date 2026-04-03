let mongoose = require('mongoose');

let productImageSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    altText: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('product_images', productImageSchema);
