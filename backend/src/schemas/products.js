let mongoose = require('mongoose');

let productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    images: {
        type: [String],
        default: []
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    },
    status: {
        type: String,
        enum: ['in_stock', 'out_of_stock', 'discontinued'],
        default: 'in_stock'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('products', productSchema);
