// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Employee'], default: 'Employee' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    profilePic: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
