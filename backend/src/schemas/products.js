let mongoose = require('mongoose');

let productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
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
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Middleware tự động tạo slug trước khi validate
productSchema.pre('validate', function () {
    if (this.name && (!this.slug || this.isModified('name'))) {
        const slugify = require('slugify');
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            locale: 'vi'
        });
    }
});

// Middleware cho findOneAndUpdate (Update slug)
productSchema.pre('findOneAndUpdate', function () {
    const update = this.getUpdate();
    if (update.name) {
        const slugify = require('slugify');
        update.slug = slugify(update.name, {
            lower: true,
            strict: true,
            locale: 'vi'
        });
    }
});

module.exports = mongoose.model('products', productSchema);
