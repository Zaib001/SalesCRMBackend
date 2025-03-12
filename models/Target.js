// models/Target.js
const mongoose = require('mongoose');

const TargetSchema = new mongoose.Schema({
    assignedTo: { type: mongoose.Schema.Types.ObjectId, refPath: 'assignedToModel', required: true },
    assignedToModel: { type: String, enum: ['User', 'Team'], required: true },
    targetAmount: { type: Number, required: true },
    targetQty: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Target', TargetSchema);

