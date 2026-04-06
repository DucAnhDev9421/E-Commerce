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
    }
}, {
    timestamps: true
});

productSchema.pre('validate', async function () {
    if (this.name && (!this.slug || this.isModified('name'))) {
        const slugify = require('slugify');
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            locale: 'vi'
        });
    }

    // Tự động cập nhật status dựa trên stock (trừ khi đã ngừng kinh doanh)
    if (this.status !== 'discontinued') {
        if (this.stock <= 0) {
            this.status = 'out_of_stock';
        } else if (this.status === 'out_of_stock' && this.stock > 0) {
            this.status = 'in_stock';
        }
    }
});

// Middleware cho findOneAndUpdate (Update slug)
productSchema.pre('findOneAndUpdate', async function () {
    const update = this.getUpdate();
    if (update.name) {
        const slugify = require('slugify');
        update.slug = slugify(update.name, {
            lower: true,
            strict: true,
            locale: 'vi'
        });
    }

    // Xử lý status nếu có update stock
    if (update.$set && update.$set.stock !== undefined) {
        if (update.$set.stock <= 0) {
            update.$set.status = 'out_of_stock';
        } else if (update.$set.status !== 'discontinued') {
            update.$set.status = 'in_stock';
        }
    }
    
    // Nếu sử dụng $inc (như trong checkout)
    if (update.$inc && update.$inc.stock !== undefined) {
        // Lưu ý: middleware pre('findOneAndUpdate') không biết giá trị stock mới sau $inc.
        // Giải pháp tốt nhất là update status trong controller sau khi thực hiện $inc,
        // hoặc chuyển findOneAndUpdate sang sử dụng aggregation pipeline.
    }
});

module.exports = mongoose.model('products', productSchema);
