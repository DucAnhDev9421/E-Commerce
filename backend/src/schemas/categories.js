let mongoose = require('mongoose');

let categorySchema = new mongoose.Schema({
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
    image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Middleware tự động tạo slug trước khi validate
categorySchema.pre('validate', async function () {
    if (this.name && (!this.slug || this.isModified('name'))) {
        const slugify = require('slugify');
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            locale: 'vi'
        });
    }
});

// Middleware cho findOneAndUpdate
categorySchema.pre('findOneAndUpdate', async function () {
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

module.exports = mongoose.model('categories', categorySchema);
