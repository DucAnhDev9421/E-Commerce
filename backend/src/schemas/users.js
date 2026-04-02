let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    phone: { 
        type: String 
    },
    avatarUrl: {
        type: String,
        default: ''
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles'
    },
    loginCount: {
        type: Number,
        default: 0
    },
    lockTime: {
        type: Date,
        default: null
    },
    refreshToken: { 
        type: String, 
        default: "" 
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('users', userSchema);
