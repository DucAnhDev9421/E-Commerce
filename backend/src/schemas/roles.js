let mongoose = require('mongoose');

let roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        enum: ['ADMIN', 'CUSTOMER', 'MANAGER']
    },
    description: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('roles', roleSchema);
