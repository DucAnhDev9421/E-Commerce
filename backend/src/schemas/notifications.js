let mongoose = require('mongoose');

let notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['SYSTEM', 'ORDER', 'REVIEW'],
        default: 'SYSTEM'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('notifications', notificationSchema);
